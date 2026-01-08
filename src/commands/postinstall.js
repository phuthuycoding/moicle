import chalk from 'chalk';

export const postinstallCommand = async () => {
  console.log('');
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log(chalk.cyan('   Claude Agents Kit installed!'));
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log('');
  console.log('Run the following command to set up:');
  console.log('');
  console.log(chalk.green('  claude-kit install'));
  console.log('');
  console.log('Or with options:');
  console.log(chalk.gray('  claude-kit install --global   # Install to ~/.claude/'));
  console.log(chalk.gray('  claude-kit install --project  # Install to ./.claude/'));
  console.log(chalk.gray('  claude-kit install --all      # Install to both'));
  console.log('');
  console.log('Other commands:');
  console.log(chalk.gray('  claude-kit list       # List installed items'));
  console.log(chalk.gray('  claude-kit uninstall  # Remove installations'));
  console.log('');
};
