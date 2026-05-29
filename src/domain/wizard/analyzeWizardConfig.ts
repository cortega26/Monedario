import type { WizardConfig, WizardResult } from "./WizardConfig";

export interface NonDiscriminativeWizardStep {
  stepId: string;
  signatures: string[];
}

function resultSignature(result: WizardResult): string {
  return result.resultKey?.trim() || `title:${result.titulo.trim()}`;
}

function collectReachableSignatures(
  config: WizardConfig,
  stepId: string,
  path = new Set<string>()
): string[] {
  if (path.has(stepId)) return [];
  const step = config.steps[stepId];
  if (!step) return [];

  const nextPath = new Set(path);
  nextPath.add(stepId);

  const signatures = new Set<string>();

  for (const option of step.opciones) {
    if (option.resultado) {
      signatures.add(resultSignature(option.resultado));
      continue;
    }
    if (!option.next) continue;
    for (const signature of collectReachableSignatures(
      config,
      option.next,
      nextPath
    )) {
      signatures.add(signature);
    }
  }

  return [...signatures].sort();
}

export function findNonDiscriminativeSteps(
  config: WizardConfig
): NonDiscriminativeWizardStep[] {
  const findings: NonDiscriminativeWizardStep[] = [];

  for (const step of Object.values(config.steps)) {
    if (step.opciones.length < 2) continue;

    const optionSignatures = step.opciones.map(option => {
      if (option.resultado) return [resultSignature(option.resultado)];
      if (!option.next) return [];
      return collectReachableSignatures(
        config,
        option.next,
        new Set([step.id])
      );
    });

    const normalized = optionSignatures.map(signatures => signatures.join("|"));
    if (normalized.length === 0) continue;

    const first = normalized[0];
    const allEqual = normalized.every(signature => signature === first);
    if (!allEqual || first.length === 0) continue;

    findings.push({
      stepId: step.id,
      signatures: optionSignatures[0],
    });
  }

  return findings;
}
