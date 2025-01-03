import { Response } from 'express';

/**
 * Utility function to check ownership of a resource without using express middleware.
 *
 * @param resource - The resource document to check ownership for.
 * @param idField - The field in the resource document that contains the ID to compare.
 * @param userId - The user ID to compare against the resource's ID field.
 * @returns true if ownership is valid; otherwise, false.
 */
const checkModelOwnership = (
  resource: any,
  idField: string,
  userId: string
): boolean => {
  if (!resource) {
    return false;
  }
  if (resource[idField]?.toString() !== userId) {
    return false;
  }

  return true;
};

export default checkModelOwnership;
