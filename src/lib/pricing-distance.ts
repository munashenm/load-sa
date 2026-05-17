/** Rough distance estimate from province pair (national coverage MVP). */
export function estimateDistanceKm(
  pickupProvince: string,
  dropoffProvince: string,
): number {
  if (pickupProvince === dropoffProvince) {
    return 120;
  }
  const longHaulPairs = new Set([
    "Western Cape-Gauteng",
    "Gauteng-Western Cape",
    "Western Cape-KwaZulu-Natal",
    "KwaZulu-Natal-Western Cape",
    "Eastern Cape-Gauteng",
    "Gauteng-Eastern Cape",
  ]);
  const key = `${pickupProvince}-${dropoffProvince}`;
  if (longHaulPairs.has(key)) {
    return 1400;
  }
  return 650;
}
