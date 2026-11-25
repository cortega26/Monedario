import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const RUN = path.resolve("ops/serp/run.sh");
const INSTALL = path.resolve("ops/serp/install.sh");
const SERVICE = path.resolve("ops/serp/monedario-serp-snapshot.service");
const TIMER = path.resolve("ops/serp/monedario-serp-snapshot.timer");
const roots: string[] = [];

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function writeExecutable(file: string, content: string) {
  writeFileSync(file, content, "utf8");
  chmodSync(file, 0o755);
}

type Harness = {
  root: string;
  repo: string;
  state: string;
  calls: string;
  notes: string;
  env: Record<string, string>;
};

function makeHarness(options: { collector?: string } = {}): Harness {
  const root = mkdtempSync(path.join(tmpdir(), "serp-auto-"));
  roots.push(root);
  const repo = path.join(root, "repo");
  const bin = path.join(root, "bin");
  mkdirSync(path.join(repo, "scripts"), { recursive: true });
  mkdirSync(bin);
  mkdirSync(path.join(root, "home"));
  writeFileSync(
    path.join(repo, "scripts/collect-serp-snapshot.mjs"),
    options.collector ?? "// stub del colector: soporta --auto\n"
  );
  const calls = path.join(root, "calls.log");
  const notes = path.join(root, "notify.log");
  writeFileSync(calls, "");
  writeFileSync(notes, "");

  writeExecutable(
    path.join(bin, "node"),
    `#!/usr/bin/env bash
echo "node $*" >> "${calls}"
cat "$STUB_OUT"
exit "\${STUB_EXIT:-0}"
`
  );
  writeExecutable(
    path.join(bin, "notify-send"),
    `#!/usr/bin/env bash
echo "$*" >> "${notes}"
`
  );
  writeExecutable(
    path.join(bin, "git"),
    `#!/usr/bin/env bash
echo "git $*" >> "${calls}"
if [ "$3" = "status" ]; then printf '%s' "\${STUB_GIT_DIRTY:-}"; fi
exit 0
`
  );

  return {
    root,
    repo,
    state: path.join(repo, "output/external-intelligence/serp"),
    calls,
    notes,
    env: {
      PATH: `${bin}:/usr/bin:/bin`,
      HOME: path.join(root, "home"),
      MONEDARIO_SERP_REPO: repo,
      DBUS_SESSION_BUS_ADDRESS: "unix:path=/nonexistent",
      MONEDARIO_SERP_NO_UPDATE: "1",
    },
  };
}

function run(h: Harness, output: string, extraEnv: Record<string, string> = {}, exit = 0) {
  const outFile = path.join(h.root, "stub-out.txt");
  writeFileSync(outFile, output);
  return spawnSync("bash", [RUN], {
    encoding: "utf8",
    env: { ...h.env, STUB_OUT: outFile, STUB_EXIT: String(exit), ...extraEnv },
  });
}

const readState = (h: Harness) =>
  JSON.parse(readFileSync(path.join(h.state, "last-run.json"), "utf8"));
const notes = (h: Harness) => readFileSync(h.notes, "utf8");
const calls = (h: Harness) => readFileSync(h.calls, "utf8");

describe("run.sh: resultado de la corrida", () => {
  it("una corrida con capturas guarda estado, marca last-ok y avisa", () => {
    const h = makeHarness();
    const result = run(
      h,
      "[serp] presupuesto propio 0/220\n[serp] capturado: utm hoy\n[serp] capturado: uf hoy (mobile)\n"
    );
    expect(result.status).toBe(0);
    expect(readState(h)).toMatchObject({ status: "ok", exit: 0, captured: 2 });
    expect(existsSync(path.join(h.state, "last-ok"))).toBe(true);
    expect(notes(h)).toContain("2 capturas nuevas");
    expect(calls(h)).toContain("scripts/collect-serp-snapshot.mjs --auto --run");
    expect(readFileSync(path.join(h.state, "runs.log"), "utf8")).toContain("ok exit=0 captured=2");
  });

  it("un día que no toca queda como skipped, sin avisos ni last-ok", () => {
    const h = makeHarness();
    const result = run(
      h,
      "[serp] hoy no es día de corrida (lunes y jueves); próxima: 2026-11-26. Usa --any-day para forzarla.\n"
    );
    expect(result.status).toBe(0);
    expect(readState(h)).toMatchObject({ status: "skipped", captured: 0 });
    expect(existsSync(path.join(h.state, "last-ok"))).toBe(false);
    expect(notes(h)).toBe("");
  });

  it("un código de salida distinto de cero falla, avisa y se propaga", () => {
    const h = makeHarness();
    const result = run(h, "[serp] error: algo\nboom\n", {}, 3);
    expect(result.status).toBe(3);
    expect(readState(h)).toMatchObject({ status: "error", exit: 3 });
    expect(notes(h)).toContain("la corrida falló");
    expect(existsSync(path.join(h.state, "last-ok"))).toBe(false);
  });

  it("'colector omitido' (sin clave) cuenta como fallo aunque salga con 0", () => {
    const h = makeHarness();
    const result = run(h, "[serp] sin SERPAPI_API_KEY; colector omitido\n");
    expect(result.status).toBe(1);
    expect(readState(h).status).toBe("error");
    expect(notes(h)).toContain("colector omitido");
  });

  it("solo errores por consulta y cero capturas es un fallo", () => {
    const h = makeHarness();
    const result = run(h, "[serp] error en «uf hoy»: SerpApi HTTP 500\n");
    expect(result.status).toBe(1);
    expect(readState(h).status).toBe("error");
    expect(notes(h)).toContain("sin capturas por errores");
  });

  it("errores parciales con capturas siguen siendo una corrida ok", () => {
    const h = makeHarness();
    const result = run(h, "[serp] capturado: a\n[serp] error en «b»: SerpApi HTTP 500\n");
    expect(result.status).toBe(0);
    expect(readState(h)).toMatchObject({ status: "ok", captured: 1 });
  });

  it("nunca imprime la clave de SerpApi", () => {
    const h = makeHarness();
    const result = run(h, "[serp] capturado: a\n", { SERPAPI_API_KEY: "CLAVE-SECRETA" });
    expect(result.stdout + result.stderr).not.toContain("CLAVE-SECRETA");
    expect(readFileSync(path.join(h.state, "last-run.json"), "utf8")).not.toContain("CLAVE-SECRETA");
  });
});

describe("run.sh: salud del timer", () => {
  it("avisa si pasaron más de 8 días sin una corrida exitosa", () => {
    const h = makeHarness();
    mkdirSync(h.state, { recursive: true });
    const old = Math.floor(Date.now() / 1000) - 10 * 86400;
    writeFileSync(path.join(h.state, "last-ok"), `${old}\n`);
    const result = run(h, "[serp] hoy no es día de corrida (lunes y jueves)\n");
    expect(result.status).toBe(0);
    expect(notes(h)).toContain("sin corridas exitosas");
    expect(notes(h)).toContain("10 días");
  });

  it("no avisa si la última corrida exitosa es reciente", () => {
    const h = makeHarness();
    mkdirSync(h.state, { recursive: true });
    writeFileSync(path.join(h.state, "last-ok"), `${Math.floor(Date.now() / 1000) - 2 * 86400}\n`);
    run(h, "[serp] hoy no es día de corrida (lunes y jueves)\n");
    expect(notes(h)).toBe("");
  });

  it("sin historial crea la línea base de instalación y no avisa", () => {
    const h = makeHarness();
    run(h, "[serp] hoy no es día de corrida (lunes y jueves)\n");
    expect(existsSync(path.join(h.state, "installed-at"))).toBe(true);
    expect(notes(h)).toBe("");
  });

  it("un last-ok dañado no rompe la corrida", () => {
    const h = makeHarness();
    mkdirSync(h.state, { recursive: true });
    writeFileSync(path.join(h.state, "last-ok"), "no-es-numero\n");
    const result = run(h, "[serp] hoy no es día de corrida (lunes y jueves)\n");
    expect(result.status).toBe(0);
    expect(notes(h)).toBe("");
  });
});

describe("run.sh: protecciones previas", () => {
  it("no corre si el colector es una versión sin --auto", () => {
    const h = makeHarness({ collector: "// versión antigua\n" });
    const result = run(h, "[serp] capturado: a\n");
    expect(result.status).toBe(1);
    expect(calls(h)).not.toContain("node ");
    expect(readState(h).status).toBe("error");
    expect(notes(h)).toContain("código desactualizado");
  });

  it("falla con aviso si no existe el colector", () => {
    const h = makeHarness();
    rmSync(path.join(h.repo, "scripts/collect-serp-snapshot.mjs"));
    const result = run(h, "");
    expect(result.status).toBe(1);
    expect(notes(h)).toContain("no se pudo ejecutar");
  });

  it("actualiza el worktree a origin/main solo si está limpio", () => {
    const clean = makeHarness();
    delete (clean.env as Record<string, string | undefined>).MONEDARIO_SERP_NO_UPDATE;
    run(clean, "[serp] capturado: a\n");
    expect(calls(clean)).toContain("fetch --quiet origin main");
    expect(calls(clean)).toContain("checkout --quiet --detach origin/main");

    const dirty = makeHarness();
    delete (dirty.env as Record<string, string | undefined>).MONEDARIO_SERP_NO_UPDATE;
    run(dirty, "[serp] capturado: a\n", { STUB_GIT_DIRTY: " M scripts/x.mjs" });
    expect(calls(dirty)).not.toContain("fetch --quiet");
    expect(calls(dirty)).not.toContain("checkout");
    expect(readState(dirty).status).toBe("ok"); // corre con el código que hay
  });

  it("MONEDARIO_SERP_NO_UPDATE=1 no toca git", () => {
    const h = makeHarness();
    run(h, "[serp] capturado: a\n");
    expect(calls(h)).not.toContain("git ");
  });
});

describe("unidades e instalador", () => {
  const service = readFileSync(SERVICE, "utf8");
  const timer = readFileSync(TIMER, "utf8");
  const install = readFileSync(INSTALL, "utf8");
  const runScript = readFileSync(RUN, "utf8");

  it("el servicio es oneshot, aislado y usa rutas por %h", () => {
    expect(service).toContain("Type=oneshot");
    expect(service).toContain("NoNewPrivileges=yes");
    expect(service).toContain("UMask=0077");
    expect(service).toContain("ExecStart=/bin/bash %h/.local/share/monedario/serp/run.sh");
    expect(service).toContain("EnvironmentFile=-%h/.config/monedario/serp.env");
    expect(service).not.toMatch(/\/home\/[a-z]/);
  });

  it("el timer corre a diario, recupera corridas perdidas y apunta al servicio", () => {
    expect(timer).toContain("OnCalendar=*-*-* 10:30:00");
    expect(timer).toContain("Persistent=true");
    expect(timer).toContain("Unit=monedario-serp-snapshot.service");
    expect(timer).toContain("WantedBy=timers.target");
  });

  it("el instalador usa permisos restrictivos y permite desinstalar", () => {
    expect(install).toContain("set -euo pipefail");
    expect(install).toContain('install -Dm700 "$SRC_DIR/run.sh"');
    expect(install).toContain('install -Dm600 "$SRC_DIR/monedario-serp-snapshot.service"');
    expect(install).toContain('install -Dm600 "$SRC_DIR/monedario-serp-snapshot.timer"');
    expect(install).toContain("--uninstall");
    expect(install).toContain("--status");
    expect(install).toContain("enable --now monedario-serp-snapshot.timer");
  });

  it("el instalador exige un worktree limpio con clave y colector actualizado", () => {
    expect(install).toContain("rev-parse --is-inside-work-tree");
    expect(install).toContain("status --porcelain");
    expect(install).toContain("SERPAPI_API_KEY");
    expect(install).toContain("--auto");
  });

  it("ningún archivo contiene secretos ni usa CI", () => {
    for (const text of [service, timer, install, runScript]) {
      expect(text).not.toMatch(/cfut_|sk-[A-Za-z0-9]{10,}|[?&]api_key=/i);
    }
    expect(runScript).not.toContain("GITHUB_ACTIONS");
  });

  it("los scripts de bash tienen sintaxis válida", () => {
    for (const file of [RUN, INSTALL]) {
      const check = spawnSync("bash", ["-n", file], { encoding: "utf8" });
      expect(check.status, check.stderr).toBe(0);
    }
  });
});
