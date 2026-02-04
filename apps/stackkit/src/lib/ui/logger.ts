import chalk from "chalk";
import ora, { Ora } from "ora";

export class Logger {
  private spinner: Ora | null = null;
  private debugMode: boolean = false;
  private silentMode: boolean = false;

  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  setSilentMode(enabled: boolean): void {
    this.silentMode = enabled;
  }

  info(message: string): void {
    if (this.silentMode) return;
    process.stdout.write(chalk.blue("ℹ") + " " + message + "\n");
  }

  success(message: string): void {
    if (this.silentMode) return;
    process.stdout.write(chalk.green("✔") + " " + message + "\n");
  }

  error(message: string, error?: Error): void {
    process.stderr.write(chalk.red("✖") + " " + message + "\n");
    if (error && this.debugMode) {
      this.debug(`Error stack: ${error.stack || error.message}`);
    }
  }

  warn(message: string): void {
    if (this.silentMode) return;
    process.stdout.write(chalk.yellow("⚠") + " " + message + "\n");
  }

  debug(message: string): void {
    if (!this.debugMode) return;
    process.stdout.write(chalk.gray("[DEBUG] ") + chalk.dim(message) + "\n");
  }

  log(message: string): void {
    if (this.silentMode) return;
    process.stdout.write(message + "\n");
  }

  newLine(): void {
    if (this.silentMode) return;
    process.stdout.write("\n");
  }

  startSpinner(text: string): Ora {
    if (this.silentMode) {
      return {
        succeed: () => {},
        fail: () => {},
        text: text,
      } as Ora;
    }
    this.spinner = ora(text).start();
    return this.spinner;
  }

  stopSpinner(success = true, text?: string): void {
    if (this.spinner && !this.silentMode) {
      if (success) {
        this.spinner.succeed(text);
      } else {
        this.spinner.fail(text);
      }
      this.spinner = null;
    }
  }

  updateSpinner(text: string): void {
    if (this.spinner && !this.silentMode) {
      this.spinner.text = text;
    }
  }

  header(text: string): void {
    if (this.silentMode) return;
    process.stdout.write(chalk.bold.cyan(text) + "\n");
  }

  footer(): void {
    if (this.silentMode) return;
    process.stdout.write("\n");
  }

  box(text: string, color: "cyan" | "green" | "yellow" | "red" = "cyan"): void {
    if (this.silentMode) return;
    const lines = text.split("\n");
    const maxLength = Math.max(...lines.map((line) => line.length));
    const border = "─".repeat(maxLength + 2);
    const colorFn = chalk[color];

    process.stdout.write(colorFn("┌" + border + "┐") + "\n");
    lines.forEach((line) => {
      const padding = " ".repeat(maxLength - line.length);
      process.stdout.write(colorFn("│ ") + line + padding + colorFn(" │") + "\n");
    });
    process.stdout.write(colorFn("└" + border + "┘") + "\n");
  }

  logWithPrefix(
    prefix: string,
    message: string,
    color: "blue" | "green" | "yellow" | "red" | "cyan" = "blue",
  ): void {
    if (this.silentMode) return;
    const colorFn = chalk[color];
    process.stdout.write(colorFn(prefix) + " " + message + "\n");
  }
}

export const logger = new Logger();
