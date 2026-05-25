import type { ProfilePatch } from "@/utils/userProfile";

export interface WizardResult {
  titulo: string;
  descripcion: string;
  pasos?: string[];
  links?: Array<{ label: string; href: string }>;
  resultKey?: string;
  primaryCta?: { label: string; href: string };
  secondaryLinks?: Array<{ label: string; href: string }>;
  nota?: string;
}

export interface WizardOption {
  label: string;
  /** ID of the next step, or omit to show resultado */
  next?: string;
  resultado?: WizardResult;
  profilePatch?: ProfilePatch;
}

export interface WizardStep {
  id: string;
  pregunta: string;
  opciones: WizardOption[];
}

export interface WizardConfig {
  /** Unique slug used for analytics events */
  id: string;
  firstStep: string;
  steps: Record<string, WizardStep>;
  analytics?: {
    startEvent?: string;
    stepEvent?: string;
    completeEvent?: string;
    ctaClickEvent?: string;
  };
}
