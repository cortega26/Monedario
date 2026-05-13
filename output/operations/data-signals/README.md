# Data Signals — Storage Policy

Archivos JSON producidos semanalmente por los scripts de data-signals.

## Estructura

```
output/operations/data-signals/
├── gsc/
│   ├── YYYY-Www-queries.json    # top queries GSC
│   ├── YYYY-Www-pages.json      # métricas por URL GSC
│   └── YYYY-Www-sitemaps.json   # estado de indexación
├── cloudflare/
│   ├── YYYY-Www-rum.json        # LCP/CLS/INP p75 por ruta
│   └── YYYY-Www-traffic.json    # tráfico diario + cache ratio
└── ahrefs/                      # solo si MON-ENV-DATA3 desbloqueado
    └── YYYY-Www-*.json
```

## Política de retención y rotación trimestral

Los archivos con más de **90 días** se mueven a `output/archive/data-signals/{source}/` cada trimestre.

### Comando de rotación manual

```bash
# Rotación GSC — archivos anteriores a hace 90 días
find output/operations/data-signals/gsc -name "*.json" \
  -mtime +90 \
  -exec bash -c 'mkdir -p output/archive/data-signals/gsc && mv "$1" output/archive/data-signals/gsc/' _ {} \;

# Rotación Cloudflare
find output/operations/data-signals/cloudflare -name "*.json" \
  -mtime +90 \
  -exec bash -c 'mkdir -p output/archive/data-signals/cloudflare && mv "$1" output/archive/data-signals/cloudflare/' _ {} \;

```

Ejecutar una vez por trimestre (enero, abril, julio, octubre).

## Nota sobre diffs en git

Los archivos en este directorio están marcados con `-diff` en `.gitattributes`. Git los commitea normalmente pero no muestra diff en `git show` o PRs — reduce el ruido en revisiones de código.
