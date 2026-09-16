import { createDataSource } from './data-source';

async function revertLastMigration(): Promise<void> {
  const dataSource = createDataSource();
  await dataSource.initialize();
  try {
    await dataSource.undoLastMigration();
    console.log('Reverted last migration.');
  } finally {
    await dataSource.destroy();
  }
}

void revertLastMigration().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
