/**
 *
 * @param label
 * @param precision
 * @returns number
 */
export function precisionRound(
  label: string | number,
  precision: number,
): number {
  const numericLabel =
    typeof label === "string" ? Number.parseFloat(label) : label;
  const scaleFactor = 10 ** precision;
  return Math.round(numericLabel * scaleFactor) / scaleFactor;
}
