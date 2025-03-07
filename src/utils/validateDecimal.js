import { Prisma } from '@prisma/client';

/**
 * Safely converts a value to Prisma.Decimal and checks if it's finite.
 * @param {string | number} value - The numeric value to convert.
 * @returns {Prisma.Decimal} - A valid finite Prisma.Decimal instance.
 * @throws {Error} - Throws error if the value is invalid or infinite.
 */
export const safeDecimal = (value) => {
  try {
    const decimalValue = new Prisma.Decimal(value);
    if (!decimalValue.isFinite()) {
      throw new Error('Decimal value must be finite.');
    }
    return decimalValue;
  } catch (error) {
    throw new Error(`Invalid Decimal value provided: ${value}`);
  }
};
