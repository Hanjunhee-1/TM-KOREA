import { createDataSource } from './data-source';

async function runMigrations(): Promise<void> {
  const dataSource = createDataSource();
  await dataSource.initialize();
  try {
    const migrations = await dataSource.runMigrations();
    if (migrations.length === 0) {
      console.log('No pending migrations.');
      return;
    }
    for (const migration of migrations) {
      console.log(`Ran migration: ${migration.name}`);
    }
  } finally {
    await dataSource.destroy();
  }
}

void runMigrations().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
