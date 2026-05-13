# Data Signals — Runbook de Mantenimiento

Fecha: 2026-04-25

---

## 1. Si el workflow de GHA falla

El workflow `.github/workflows/data-signals.yml` corre diariamente y puede fallar por:
- Token expirado o revocado.
- Secret o variable de GitHub Actions faltante (`GOOGLE_APPLICATION_CREDENTIALS_JSON`, `CLOUDFLARE_ANALYTICS_TOKEN`, `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_ACCOUNT_ID`).
- Cambio de formato en la API de GSC o Cloudflare.
- Quota agotada en GSC.

**Pasos:**

1. Ir a **GitHub → Actions → data-signals** y abrir el run fallido.
2. Expandir el step que falló y leer el mensaje de error completo.
3. Para re-ejecutar manualmente con `workflow_dispatch`:
   ```bash
   gh workflow run data-signals.yml --ref main
   ```
4. Para ver los últimos runs:
   ```bash
   gh run list --workflow=data-signals.yml --limit=10
   ```

---

## 2. Rotación de tokens

Los tokens tienen vida útil de **6 meses**. Fechas de rotación aproximadas:

| Secret | Próxima rotación |
|---|---|
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | 6 meses desde aprovisionamiento |
| `CLOUDFLARE_ANALYTICS_TOKEN` | 6 meses desde aprovisionamiento |

### Cómo actualizar secretos y variables en GHA

```bash
# Service account de GSC: regenerar clave en Google Cloud Console, luego:
gh secret set GOOGLE_APPLICATION_CREDENTIALS_JSON \
  --body "$(cat nueva-service-account-key.json)"

# Token de Cloudflare: crear nuevo en dash.cloudflare.com, luego:
gh secret set CLOUDFLARE_ANALYTICS_TOKEN \
  --body "cftoken_xxxxxxxxxxxxx"

# IDs de Cloudflare: configurar como variables de Actions
gh variable set CLOUDFLARE_ZONE_ID \
  --body "<cloudflare-zone-id>"

gh variable set CLOUDFLARE_ACCOUNT_ID \
  --body "<cloudflare-account-id>"
```

### Verificar que el token nuevo funciona (dry-run)

```bash
# GSC — requiere GOOGLE_APPLICATION_CREDENTIALS_JSON en entorno local
pnpm run data-signals:gsc -- --week=2026-W16 --dry-run

# Cloudflare — requiere CLOUDFLARE_ANALYTICS_TOKEN, CLOUDFLARE_ZONE_ID y CLOUDFLARE_ACCOUNT_ID en entorno local
pnpm run data-signals:cloudflare -- --week=2026-W16 --dry-run
```

---

## 3. Si hay 0 rows en el RUM (cloudflare rum.json vacío)

**No es un error.** El RUM de Cloudflare requiere visitas reales que activen el beacon. En semanas con tráfico bajo (feriados, semanas sin publicación) puede haber pocas o ninguna fila.

Síntomas normales:
- `{week}-rum.json` con `"data": []`
- El bloque "Performance real" no aparece en el scorecard (porque no hay rows)

Síntoma de error real:
- El script termina con exit code 1 o un error en los logs de GHA

Si hay 0 rows por más de 3 semanas consecutivas, investigar si el beacon de RUM está activo en Cloudflare Dashboard → Web Analytics.

---

## 4. Regenerar una semana específica

Si los archivos de una semana están corruptos o faltan:

```bash
# GSC — semana específica
GOOGLE_APPLICATION_CREDENTIALS_JSON="$(cat .env.local | grep GOOGLE | cut -d= -f2-)" \
  pnpm run data-signals:gsc -- --week=2026-W16

# Cloudflare — semana específica
CLOUDFLARE_ANALYTICS_TOKEN="..." \
  pnpm run data-signals:cloudflare -- --week=2026-W16
```

Para verificar sin escribir archivos, usar `--dry-run`:

```bash
pnpm run data-signals:gsc -- --week=2026-W16 --dry-run
pnpm run data-signals:cloudflare -- --week=2026-W16 --dry-run
```

---

## 5. Rotación trimestral de archivos JSON

Los archivos con más de 90 días se mueven a `output/archive/data-signals/`. Ver `output/operations/data-signals/README.md` para el comando completo.

Ejecutar una vez por trimestre (enero, abril, julio, octubre).
