import mongoose from 'mongoose';

export async function withTransaction(
  db: mongoose.Connection,
  useTransactions: boolean,
  fn: (session: mongoose.ClientSession | null) => Promise<void>,
  cleanup?: () => Promise<void>,
): Promise<void> {
  if (useTransactions) {
    const session = await db.startSession();
    try {
      session.startTransaction();
      await fn(session);
      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction().catch(() => {});
      throw error;
    } finally {
      await session.endSession().catch(() => {});
    }
  } else {
    try {
      await fn(null);
    } catch (error) {
      if (cleanup) {
        await cleanup().catch(() => {});
      }
      throw error;
    }
  }
}
