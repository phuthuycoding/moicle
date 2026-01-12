import chalk from 'chalk';

export const postinstallCommand = async () => {
  console.log('');
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log(chalk.cyan('   MoiCle installed!'));
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log('');
  console.log('Run the following command to set up:');
  console.log('');
  console.log(chalk.green('  moicle install'));
  console.log('');
  console.log('Or with options:');
  console.log(chalk.gray('  moicle install --global   # Install to ~/.claude/'));
  console.log(chalk.gray('  moicle install --project  # Install to ./.claude/'));
  console.log(chalk.gray('  moicle install --all      # Install to both'));
  console.log('');
  console.log('Other commands:');
  console.log(chalk.gray('  moicle list       # List installed items'));
  console.log(chalk.gray('  moicle uninstall  # Remove installations'));
  console.log('');
};
