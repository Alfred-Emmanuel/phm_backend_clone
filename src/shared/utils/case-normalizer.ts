/**
 * Normalizes input string to match enum values.
 * @param input The string input to normalize
 * @param enumObject The enum object to check against
 * @returns The matching enum value or null if no match is found
 */
export function normalizeEnumValue<T extends object>(
  input: string,
  enumObject: T,
): T[keyof T] | null {
  if (!input) return null;

  // Handle special cases with multiple words (like 'Akwa Ibom', 'Cross River', etc.)
  if (input.includes('_')) {
    // If input has underscores (e.g., 'cross_river'), convert to space-separated title case
    input = input
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  } else if (!input.includes(' ')) {
    // Simple case: single word
    input = input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
  } else {
    // Multi-word case (e.g., 'akwa ibom')
    input = input
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Check exact match first
  for (const key in enumObject) {
    if (typeof enumObject[key] === 'string' && enumObject[key] === input) {
      return enumObject[key] as T[keyof T];
    }
  }

  // If no exact match, try to find case-insensitive match
  for (const key in enumObject) {
    if (
      typeof enumObject[key] === 'string' &&
      (enumObject[key] as string).toLowerCase() === input.toLowerCase()
    ) {
      return enumObject[key] as T[keyof T];
    }
  }

  return null;
}
