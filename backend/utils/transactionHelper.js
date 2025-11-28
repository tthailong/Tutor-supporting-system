import mongoose from "mongoose";
import logger from "./logger.js";

/**
 * Execute a callback function within a MongoDB transaction
 * Provides automatic commit/rollback and error handling
 * 
 * @param {Function} callback - Async function to execute within transaction
 * @returns {Promise} Result from callback or throws error
 */
export async function withTransaction(callback) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const result = await callback(session);
    await session.commitTransaction();
    logger.info("Transaction committed successfully");
    return result;
  } catch (error) {
    await session.abortTransaction();
    logger.error("Transaction aborted due to error", {
      error: error.message,
      stack: error.stack
    });
    throw error;
  } finally {
    session.endSession();
  }
}

/**
 * Execute multiple operations atomically
 * Useful for complex multi-document updates
 * 
 * @param {Array} operations - Array of async functions to execute
 * @param {mongoose.ClientSession} session - MongoDB session
 * @returns {Promise<Array>} Results from all operations
 */
export async function executeAtomically(operations, session) {
  const results = [];
  
  for (const operation of operations) {
    const result = await operation(session);
    results.push(result);
  }
  
  return results;
}
