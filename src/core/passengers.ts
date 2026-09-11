/** VR Matkalla passenger types (matches vr.fi query params). */
export type PassengerCategory = "adult" | "student";

export const VR_PASSENGER_TYPE: Record<PassengerCategory, string> = {
  adult: "ADULT",
  student: "STUDENT",
} as const;

/** Legacy shop.vr.fi numeric passenger type codes (junastin). */
export const LEGACY_PASSENGER_CODE: Record<PassengerCategory, number> = {
  adult: 84,
  student: 85,
} as const;

export function resolvePassengerCategory(input: string): PassengerCategory {
  const q = input.trim().toLowerCase();
  if (q === "adult" || q === "aikuinen") return "adult";
  if (q === "student" || q === "opiskelija" || q === "stu") return "student";
  throw new Error(
    `Unknown passenger type "${input}". Use "adult" or "student".`
  );
}

export function toVrPassengerType(category: PassengerCategory): string {
  return VR_PASSENGER_TYPE[category];
}

/** Student fares are typically lower; mock uses this multiplier. */
export function passengerPriceMultiplier(category: PassengerCategory): number {
  return category === "student" ? 0.72 : 1;
}
