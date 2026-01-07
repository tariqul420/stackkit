import chalk from 'chalk';
import ora, { Ora } from 'ora';

export class Logger {
  private spinner: Ora | null = null;

  info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  }

  success(message: string): void {
    console.log(chalk.green('✔'), message);
  }

  error(message: string): void {
    console.log(chalk.red('✖'), message);
  }

  warn(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  }

  log(message: string): void {
    console.log(message);
  }

  newLine(): void {
    console.log();
  }

  startSpinner(text: string): Ora {
    this.spinner = ora(text).start();
    return this.spinner;
  }

  stopSpinner(success = true, text?: string): void {
    if (this.spinner) {
      if (success) {
        this.spinner.succeed(text);
      } else {
        this.spinner.fail(text);
      }
      this.spinner = null;
    }
  }

  updateSpinner(text: string): void {
    if (this.spinner) {
      this.spinner.text = text;
    }
  }

  header(text: string): void {
    console.log();
    console.log(chalk.bold.cyan(`╭─ ${text}`));
    console.log(chalk.cyan('│'));
  }

  footer(): void {
    console.log(chalk.cyan('│'));
    console.log(chalk.cyan('╰─'));
    console.log();
  }
}

export const logger = new Logger();
