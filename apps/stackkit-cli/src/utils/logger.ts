import chalk from "chalk";
import ora, { Ora } from "ora";

export class Logger {
  private spinner: Ora | null = null;

  info(message: string): void {
    process.stdout.write(chalk.blue("ℹ") + " " + message + "\n");
  }

  success(message: string): void {
    process.stdout.write(chalk.green("✔") + " " + message + "\n");
  }

  error(message: string): void {
    process.stderr.write(chalk.red("✖") + " " + message + "\n");
  }

  warn(message: string): void {
    process.stdout.write(chalk.yellow("⚠") + " " + message + "\n");
  }

  log(message: string): void {
    process.stdout.write(message + "\n");
  }

  newLine(): void {
    process.stdout.write("\n");
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
    process.stdout.write(chalk.bold.cyan(text) + "\n");
  }

  footer(): void {
    process.stdout.write("\n");
  }
}

export const logger = new Logger();