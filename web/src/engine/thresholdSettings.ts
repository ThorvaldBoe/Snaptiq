export const minimumThreshold = 1;
export const maximumThreshold = 254;
export const defaultThreshold = 128;

export class InvalidThresholdError extends Error {
  public constructor(threshold: number) {
    super(`Threshold must be between ${minimumThreshold} and ${maximumThreshold}. Actual value: ${threshold}.`);
    this.name = 'InvalidThresholdError';
  }
}

export function validateThreshold(threshold: number): void {
  if (!Number.isInteger(threshold) || threshold < minimumThreshold || threshold > maximumThreshold) {
    throw new InvalidThresholdError(threshold);
  }
}
