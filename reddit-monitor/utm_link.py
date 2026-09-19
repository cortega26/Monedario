#!/usr/bin/env python3
"""
Generador rapido de links con UTM para compartir manualmente en Reddit.
Uso local, sin conexion a la API — Carlos lo corre a mano cada vez que va
a pegar un link de Monedario en un comentario/hilo, para poder despues ver
en Search Console/Ahrefs que subreddits e hilos realmente convierten.

Uso:
  python3 utm_link.py <url_de_monedario> <subreddit> [nota_de_campana]

Ejemplo:
  python3 utm_link.py https://monedario.cl/calculadoras/dividendo-hipotecario FinanzasChile pregunta-dividendo
  -> https://monedario.cl/calculadoras/dividendo-hipotecario?utm_source=reddit&utm_medium=community&utm_campaign=FinanzasChile&utm_content=pregunta-dividendo
"""
import sys
import urllib.parse


def build_link(base_url: str, subreddit: str, campaign_note: str = "") -> str:
    parsed = urllib.parse.urlsplit(base_url)
    query = dict(urllib.parse.parse_qsl(parsed.query))
    query.update({
        "utm_source": "reddit",
        "utm_medium": "community",
        "utm_campaign": subreddit,
    })
    if campaign_note:
        query["utm_content"] = campaign_note
    new_query = urllib.parse.urlencode(query)
    return urllib.parse.urlunsplit(parsed._replace(query=new_query))


def main() -> int:
    if len(sys.argv) < 3:
        print("Uso: utm_link.py <url_de_monedario> <subreddit> [nota_de_campana]", file=sys.stderr)
        return 2
    base_url = sys.argv[1]
    subreddit = sys.argv[2]
    note = sys.argv[3] if len(sys.argv) > 3 else ""
    print(build_link(base_url, subreddit, note))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
