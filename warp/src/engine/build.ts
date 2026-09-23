/**
 * WEIGHT, ONE SCALE FOR EVERYTHING.
 *
 * Body weight runs −100..100. The picture, the kilograms and every word for her build read it
 * through these, so a woman the text calls fat is drawn fat and weighs what a fat woman weighs.
 */
export type Build = "skinny" | "thin" | "slim" | "plump" | "chubby" | "fat" | "obese";

export function buildOf(weight: number): Build {
  if (weight < -50) return "skinny";
  if (weight < -20) return "thin";
  if (weight <= 10) return "slim";
  if (weight <= 22) return "plump";
  if (weight <= 40) return "chubby";
  if (weight <= 62) return "fat";
  return "obese";
}

/** The original game's weight scale, which runs about −100..200 and is what the art tables read. */
export function artWeight(weight: number): number {
  return weight > 0 ? weight * 2.6 : weight * 1.4;
}

/** Kilograms from weight and height, through a body-mass index of about 17 to 41. */
export function kgFor(weight: number, height_cm: number): number {
  const bmi = 21 + (weight > 0 ? weight * 0.2 : weight * 0.07);
  return Math.round(bmi * (height_cm / 100) ** 2 * 10) / 10;
}
