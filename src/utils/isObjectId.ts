import mongoose from 'mongoose';

/**
 * Whether the input is an BSON ObjectID.
 */
function isObjectId(toCheck: unknown): toCheck is mongoose.Types.ObjectId | string | number {
  try {
    // require them to be equal to ensure that toCheck is actually a hex representation
    // of an objectid instead of a 12- or 24-character string
    return new mongoose.Types.ObjectId(toCheck as string).toHexString() === toCheck;
  } catch {
    return false;
  }
}

export { isObjectId };
