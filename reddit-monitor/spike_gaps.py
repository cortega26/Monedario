#!/usr/bin/env python3
"""
PILOTO (Fase 0) del monitor bidireccional — SOLO LECTURA, DESCARTABLE.

Responde con datos, antes de tocar el esquema o la UI, si comparar los hilos de
Reddit contra el catalogo de Monedario (catalog.json) sirve para:
  - OPORTUNIDADES: hilos con una pagina muy parecida -> sugerir esa pagina.
  - BRECHAS: hilos financieros recurrentes sin pagina parecida -> contenido nuevo.

Que hace:
  1. Trae posts recientes de los subs de config.json paginando /new (hasta
     --pages paginas de 100 por sub). Solo lectura: nunca escribe en la DB.
  2. Descarta cuentas propias (own_authors), borrados y removidos. NO guarda
     autor. El corpus vive solo en memoria y en un JSON temporal (--out).
  3. Embebe catalogo y posts con MiniLM (semantic._get_model, el mismo modelo
     del monitor) y calcula la similitud coseno maxima por post.
  4. Imprime un informe en Markdown para validar a ojo (ver informe en
     docs/reports/). Los umbrales NO estan calibrados: el informe muestra las
     distribuciones y ejemplos por banda justamente para fijarlos.

La version con tests, persistencia y umbrales calibrados sera gap_analysis.py
(Fase 3); este archivo se elimina o se reduce a un wrapper.

Uso: (1) en el repo, `pnpm run export:reddit-catalog` genera reddit-monitor/catalog.json
(no se versiona); (2) copiar spike_gaps.py y catalog.json a la VM; (3) alli, donde
estan el modelo y las credenciales:
    python3 spike_gaps.py <directorio_de_trabajo> [--pages 10] [--days 180]
Al terminar, borrar de la VM el catalogo y los JSON temporales (contienen titulos
de terceros).
"""
import argparse
import json
import re
import sys
import time
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import monitor  # noqa: E402  (get_token, api_get, is_own_author)
import semantic  # noqa: E402  (_get_model: mismo modelo que el monitor)

SLEEP_S = 1.2            # ~50 req/min: bajo el limite de 60/min del free tier
SNIPPET_CHARS = 300
COVERAGE_FULL = {"article", "calculator", "guide"}

# Umbrales EXPLORATORIOS (no calibrados) — solo para segmentar el informe.
COVERED_MIN = 0.70       # similitud con una pagina "full" para considerarlo cubierto/sugerible
CLUSTER_MIN_SIM = 0.55   # similitud promedio para agrupar hilos entre si
# Relevancia: la primera iteracion uso "parecido al catalogo" como filtro y dejo
# pasar turismo, autos y musica. Ahora: sub 100 % financiero, o keyword del monitor.
FINANCE_SUBS = {"FinanzasChile", "ChileInversiones"}
TEMPLATE_MIN_REPEATS = 5  # titulos (con digitos normalizados) repetidos >= N = hilo plantilla


def fetch_subreddit_history(sub, token, ua, pages):
    """Posts recientes de un sub paginando /new. Devuelve dicts crudos de la API."""
    posts, after = [], None
    for _ in range(pages):
        path = f"/r/{sub}/new?limit=100" + (f"&after={after}" if after else "")
        time.sleep(SLEEP_S)
        listing = monitor.api_get(path, token, ua)["data"]
        children = [c["data"] for c in listing.get("children", [])]
        posts.extend(children)
        after = listing.get("after")
        if not after or not children:
            break
    return posts


def to_row(d, sub, cfg):
    """Fila del corpus o None si no debe entrar (propio, borrado, removido)."""
    if monitor.is_own_author(d.get("author"), cfg):
        return None
    if d.get("removed_by_category") or d.get("selftext") in ("[removed]", "[deleted]"):
        return None
    title = (d.get("title") or "").strip()
    if not title:
        return None
    body = (d.get("selftext") or "").strip()[:SNIPPET_CHARS]
    return {
        "sub": sub,
        "stickied": bool(d.get("stickied")),
        "permalink": d.get("permalink", ""),
        "created_utc": d.get("created_utc", 0),
        "score": d.get("score") or 0,
        "num_comments": d.get("num_comments") or 0,
        "title": title,
        "text": f"{title}. {body}".strip(),  # sin autor: no se guarda
    }


def embed(model, texts):
    return model.encode(texts, batch_size=64, normalize_embeddings=True,
                        show_progress_bar=False, convert_to_numpy=True)


def quantiles(values, qs=(0.1, 0.25, 0.5, 0.75, 0.9)):
    if not values:
        return {}
    ordered = sorted(values)
    return {f"p{int(q * 100)}": round(ordered[min(int(q * len(ordered)), len(ordered) - 1)], 3) for q in qs}


def md_escape(text):
    return text.replace("|", "\\|").replace("\n", " ")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("workdir", type=Path)
    ap.add_argument("--pages", type=int, default=10)
    ap.add_argument("--out", type=Path, default=Path("/tmp/spike_gaps.json"))
    ap.add_argument("--days", type=int, default=180, help="solo posts de los ultimos N dias")
    ap.add_argument("--cache", type=Path, default=Path("/tmp/spike_corpus.json"),
                    help="corpus crudo temporal para reiterar sin volver a descargar (borrar al terminar)")
    args = ap.parse_args()

    import numpy as np
    from sklearn.cluster import AgglomerativeClustering

    cfg = monitor.load_config(args.workdir)
    creds = json.loads((args.workdir / "credentials.json").read_text(encoding="utf-8"))
    ua = creds["user_agent"]
    token = monitor.get_token(creds["client_id"], creds["client_secret"], ua)
    catalog = json.loads((args.workdir / "catalog.json").read_text(encoding="utf-8"))["entries"]

    # 1) corpus (con cache temporal para poder iterar sin volver a descargar)
    rows, per_sub = [], Counter()
    if args.cache.exists():
        rows = json.loads(args.cache.read_text(encoding="utf-8"))
        per_sub = Counter(r["sub"] for r in rows)
        print(f"corpus desde cache: {len(rows)} posts", file=sys.stderr)
    for sub in ([] if rows else cfg["subreddits"]):
        try:
            raw = fetch_subreddit_history(sub, token, ua, args.pages)
        except Exception as exc:  # noqa: BLE001 — un sub caido no tumba el piloto
            print(f"aviso: r/{sub}: {exc}", file=sys.stderr)
            continue
        for d in raw:
            row = to_row(d, sub, cfg)
            if row:
                rows.append(row)
                per_sub[sub] += 1
        print(f"r/{sub}: {per_sub[sub]} posts", file=sys.stderr)
    if not rows:
        print("Sin corpus: nada que analizar.", file=sys.stderr)
        return 1
    if not args.cache.exists():
        args.cache.write_text(json.dumps(rows, ensure_ascii=False), encoding="utf-8")

    # 1b) filtros: recencia, plantillas y relevancia financiera (antes de embeber)
    n_raw = len(rows)
    cutoff = time.time() - args.days * 86400
    rows = [r for r in rows if r["created_utc"] >= cutoff and not r.get("stickied")]
    norm_title = lambda t: re.sub(r"\d+", "#", re.sub(r"\s+", " ", t.lower()))[:60]  # noqa: E731
    repeats = Counter(norm_title(r["title"]) for r in rows)
    n_recent = len(rows)
    rows = [r for r in rows if repeats[norm_title(r["title"])] < TEMPLATE_MIN_REPEATS]
    n_notemplate = len(rows)
    keywords = list(cfg["keywords"]) + list(cfg.get("finance_context_words", []))
    rows = [r for r in rows if r["sub"] in FINANCE_SUBS or monitor.matched_keywords(r["text"], keywords)]
    print(f"filtros: {n_raw} crudos -> {n_recent} recientes -> {n_notemplate} sin plantillas "
          f"-> {len(rows)} financieros", file=sys.stderr)
    if len(rows) < 5:
        print("Muy pocos posts tras filtrar.", file=sys.stderr)
        return 1
    per_sub = Counter(r["sub"] for r in rows)

    # 2) embeddings y similitud
    model = semantic._get_model()
    cat_vecs = embed(model, [c["text"] for c in catalog])
    post_vecs = embed(model, [r["text"] for r in rows])
    sims = post_vecs @ cat_vecs.T                      # (posts, catalogo)
    full_idx = np.array([i for i, c in enumerate(catalog) if c["type"] in COVERAGE_FULL])
    for i, r in enumerate(rows):
        best_any = int(sims[i].argmax())
        best_full = int(full_idx[sims[i][full_idx].argmax()])
        r["sim_any"] = float(sims[i][best_any])
        r["page_any"] = catalog[best_any]["url"]
        r["sim_full"] = float(sims[i][best_full])
        r["page_full"] = catalog[best_full]["url"]
        r["page_full_title"] = catalog[best_full]["title"]

    # 3) agrupar solo lo financiero (proxy: parecido a alguna pagina del catalogo)
    on_topic = list(range(len(rows)))
    clusters = defaultdict(list)
    if len(on_topic) >= 2:
        labels = AgglomerativeClustering(
            n_clusters=None, metric="cosine", linkage="average",
            distance_threshold=1 - CLUSTER_MIN_SIM,
        ).fit_predict(post_vecs[on_topic])
        for idx, lab in zip(on_topic, labels):
            clusters[int(lab)].append(idx)

    def cluster_summary(members):
        rs = [rows[i] for i in members]
        centroid = post_vecs[members].mean(axis=0)
        centroid /= (np.linalg.norm(centroid) or 1.0)
        central = max(members, key=lambda i: float(post_vecs[i] @ centroid))
        best = int(full_idx[(cat_vecs[full_idx] @ centroid).argmax()])
        return {
            "n": len(rs),
            "subs": sorted({r["sub"] for r in rs}),
            "engagement": sum(r["score"] + r["num_comments"] for r in rs),
            "mean_sim_full": round(float(np.mean([r["sim_full"] for r in rs])), 3),
            "nearest": catalog[best]["url"],
            "nearest_title": catalog[best]["title"],
            "nearest_sim": round(float(cat_vecs[best] @ centroid), 3),
            "examples": [rows[i]["title"] for i in sorted(members, key=lambda j: -rows[j]["score"])[:4]],
            "central": max(rs, key=lambda r: r["score"] + r["num_comments"])["title"],
        }

    summaries = [cluster_summary(m) for m in clusters.values() if len(m) >= 3]
    gaps = sorted([s for s in summaries if s["mean_sim_full"] < COVERED_MIN],
                  key=lambda s: -(s["n"] * (1 + s["engagement"] ** 0.5)))[:15]
    covered = sorted([s for s in summaries if s["mean_sim_full"] >= COVERED_MIN],
                     key=lambda s: -s["n"])[:10]

    # 4) informe
    t0 = min(r["created_utc"] for r in rows)
    t1 = max(r["created_utc"] for r in rows)
    print("# Piloto de brechas y oportunidades (reddit-monitor)\n")
    print(f"- Corpus: **{len(rows)} posts** de {len(per_sub)} subs "
          f"({time.strftime('%Y-%m-%d', time.gmtime(t0))} -> {time.strftime('%Y-%m-%d', time.gmtime(t1))}).")
    print(f"- Catalogo: {len(catalog)} paginas ({dict(Counter(c['type'] for c in catalog))}).")
    print(f"- Filtros: ultimos {args.days} dias, sin plantillas/stickied, financiero (sub {sorted(FINANCE_SUBS)} o keyword). "
          f"Crudos {n_raw} -> {n_recent} recientes -> {n_notemplate} sin plantillas -> **{len(rows)} analizados**.")
    print(f"- Modelo: `{semantic.MODEL_VERSION}`. Umbrales EXPLORATORIOS: cubierto/sugerible >= {COVERED_MIN}, "
          f"agrupar >= {CLUSTER_MIN_SIM}.\n")
    print("## Posts por sub\n\n| Sub | Posts |\n|---|---|")
    for sub, n in per_sub.most_common():
        print(f"| r/{sub} | {n} |")
    print("\n## Distribucion de similitud\n")
    print(f"- max con cualquier pagina: {quantiles([r['sim_any'] for r in rows])}")
    print(f"- max con articulo/calculadora/guia: {quantiles([r['sim_full'] for r in rows])}")
    bands = Counter()
    for r in rows:
        bands["con pagina parecida (>=%.2f)" % COVERED_MIN if r["sim_full"] >= COVERED_MIN else "sin pagina parecida"] += 1
    print(f"- bandas: {dict(bands)}")

    print("\n## OPORTUNIDADES — muestra para juzgar (¿la pagina sugerida es apropiada?)\n")
    print("| # | Sub | Hilo | Pagina sugerida | Sim |\n|---|---|---|---|---|")
    top = sorted([r for r in rows if r["sim_full"] >= COVERED_MIN], key=lambda r: -r["sim_full"])
    sample = top[:30]
    for k, r in enumerate(sample, 1):
        print(f"| {k} | r/{r['sub']} | {md_escape(r['title'][:90])} | {r['page_full']} | {r['sim_full']:.2f} |")

    print("\n## BRECHAS — grupos recurrentes financieros sin pagina parecida (top 15)\n")
    for k, s in enumerate(gaps, 1):
        print(f"### {k}. {md_escape(s['central'][:100])}")
        print(f"- {s['n']} hilos en {len(s['subs'])} subs ({', '.join('r/' + x for x in s['subs'])}); "
              f"engagement {s['engagement']}; sim media a paginas: {s['mean_sim_full']}")
        print(f"- Pagina mas cercana: {s['nearest']} — {s['nearest_title']} (sim {s['nearest_sim']})")
        for ex in s["examples"]:
            print(f"  - {md_escape(ex[:110])}")
        print()

    print("## Control: grupos recurrentes YA cubiertos (top 10)\n")
    for s in covered:
        print(f"- {s['n']} hilos: {md_escape(s['central'][:80])} -> {s['nearest']} ({s['nearest_sim']})")

    args.out.write_text(json.dumps(
        {"rows": [{k: v for k, v in r.items() if k != "text"} for r in rows], "gaps": gaps, "covered": covered},
        ensure_ascii=False), encoding="utf-8")
    print(f"\n_(detalle JSON temporal en {args.out}; borrar al terminar)_", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
