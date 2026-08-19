/**
 * Runs every seed in dependency order: admin → catalog → content.
 * Each child seed is idempotent, so this is safe to re-run.
 */
import { spawnSync } from 'child_process';
import path from 'path';

const steps = ['seed.ts', 'seedCatalog.ts', 'seedContent.ts'];

for (const step of steps) {
  console.log(`\n──────── ${step} ────────`);
  const r = spawnSync(process.execPath, [
    require.resolve('tsx/cli'),
    path.join(__dirname, step),
  ], { stdio: 'inherit' });
  if (r.status !== 0) {
    console.error(`\n❌ ${step} failed — stopping.`);
    process.exit(r.status ?? 1);
  }
}
console.log('\n✅ All seeds completed.');
