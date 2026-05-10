module.exports = {
  "ci": {
    "collect": {
      "staticDistDir": "dist",
      "url": [
        "/",
        "/posts/como-calcular-sueldo-liquido/",
        "/calculadoras/sueldo-liquido/",
        "/guias/ahorro-e-inversion/",
        "/guias/"
      ],
      "numberOfRuns": 3,
      "settings": {
        "emulatedFormFactor": "mobile",
        "throttling": {
          "cpuSlowdownMultiplier": 4
        },
        "screenEmulation": {
          "mobile": true,
          "width": 375,
          "height": 812,
          "deviceScaleFactor": 2
        },
        "formFactor": "mobile"
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": [
          "warn",
          {
            "minScore": 0.8
          }
        ],
        "largest-contentful-paint": [
          "warn",
          {
            "maxNumericValue": 2500
          }
        ],
        "cumulative-layout-shift": [
          "warn",
          {
            "maxNumericValue": 0.1
          }
        ]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
};
