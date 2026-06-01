import chalk from 'chalk';
import type { FileResult } from '../../types.js';

export const printHeader = (): void => {
  console.log('');
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log(chalk.cyan('   MoiCle Installer'));
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log('');
};

export const printSummary = (results: FileResult[]): void => {
  const created = results.filter((r) => r.status === 'created').length;
  const updated = results.filter((r) => r.status === 'updated').length;
  const exists = results.filter((r) => r.status === 'exists').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;
  const errors = results.filter((r) => r.status === 'error').length;

  if (created > 0) console.log(chalk.green(`  Created: ${created}`));
  if (updated > 0) console.log(chalk.yellow(`  Updated: ${updated}`));
  if (exists > 0) console.log(chalk.gray(`  Already exists: ${exists}`));
  if (skipped > 0) console.log(chalk.gray(`  Skipped: ${skipped}`));
  if (errors > 0) console.log(chalk.red(`  Errors: ${errors}`));
};

/** Print "✓ <what> installed to <dir>" followed by the status summary. */
export const printInstalled = (what: string, targetDir: string, results: FileResult[]): void => {
  console.log(chalk.green(`  ✓ ${what} installed to ${chalk.cyan(targetDir)}`));
  printSummary(results);
};
