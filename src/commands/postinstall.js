import chalk from 'chalk';

export const postinstallCommand = async () => {
  console.log('');
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log(chalk.cyan('   Moi Clau installed!'));
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log('');
  console.log('Run the following command to set up:');
  console.log('');
  console.log(chalk.green('  moiclau install'));
  console.log('');
  console.log('Or with options:');
  console.log(chalk.gray('  moiclau install --global   # Install to ~/.claude/'));
  console.log(chalk.gray('  moiclau install --project  # Install to ./.claude/'));
  console.log(chalk.gray('  moiclau install --all      # Install to both'));
  console.log('');
  console.log('Other commands:');
  console.log(chalk.gray('  moiclau list       # List installed items'));
  console.log(chalk.gray('  moiclau uninstall  # Remove installations'));
  console.log('');
};
