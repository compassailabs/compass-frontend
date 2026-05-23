export type CompassPath = "preset" | "custom";
export type StepKey = "strategy" | "deposit" | "markets" | "review" | "launching";

export const STEP_SEQUENCE: Record<CompassPath, StepKey[]> = {
  preset: ["strategy", "deposit", "review", "launching"],
  custom: ["strategy", "markets", "deposit", "review", "launching"],
};

export const STEP_NAMES: Record<StepKey, string> = {
  strategy: "Strategy",
  deposit: "Deposit",
  markets: "Markets",
  review: "Review",
  launching: "Launch",
};

export function nextStep(path: CompassPath, current: StepKey): StepKey | null {
  const seq = STEP_SEQUENCE[path];
  const idx = seq.indexOf(current);
  if (idx < 0 || idx === seq.length - 1) return null;
  return seq[idx + 1];
}

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function stepHref(step: StepKey, path: CompassPath) {
  return `/create/${step}?path=${path}`;
}
