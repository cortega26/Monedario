module.exports = {
  ci: {
    collect: {
      staticDistDir: "dist",
      url: [
        "/",
        "/posts/como-calcular-sueldo-liquido/",
        "/calculadoras/sueldo-liquido/",
        "/guias/ahorro-e-inversion/",
        "/guias/",
      ],
      numberOfRuns: 3,
      settings: {
        preset: "desktop",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.99 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 1700 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0 }],
        "total-blocking-time": ["error", { maxNumericValue: 0 }],
        "speed-index": ["error", { maxNumericValue: 3000 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
