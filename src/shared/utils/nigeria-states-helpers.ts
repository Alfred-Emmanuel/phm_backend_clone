import { NigerianStates } from './nigeria-states';
import { normalizeEnumValue } from './case-normalizer';

/**
 * Normalizes a string input to match a valid Nigerian state.
 * Handles case sensitivity and multi-word states.
 *
 * @param input The input string to normalize
 * @returns A valid NigerianStates enum value or null if not found
 */
export function normalizeNigerianState(input: string): NigerianStates | null {
  return normalizeEnumValue(input, NigerianStates);
}

/**
 * Validates if a given input is a valid Nigerian state.
 *
 * @param input The input string to validate
 * @returns True if the input is a valid Nigerian state, false otherwise
 */
export function isValidNigerianState(input: string): boolean {
  return normalizeNigerianState(input) !== null;
}
