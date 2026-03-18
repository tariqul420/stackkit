import ejs from "ejs";
import status from "http-status";
import nodemailer from "nodemailer";
import path from "path";
import { envVars } from "../../config/env";
import { AppError } from "../errors/app-error";

const transporter = nodemailer.createTransport({
  host: envVars.EMAIL_SENDER.SMTP_HOST,
  secure: true,
  auth: {
    user: envVars.EMAIL_SENDER.SMTP_USER,
    pass: envVars.EMAIL_SENDER.SMTP_PASS,
  },
  port: Number(envVars.EMAIL_SENDER.SMTP_PORT),
});

transporter.verify().catch(() => null);

interface SendEmailOptions {
  to: string;
  subject: string;
  templateName: string;
  templateData: Record<string, string | number | boolean | object>;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

export const sendEmail = async ({
  subject,
  templateData,
  templateName,
  to,
  attachments,
}: SendEmailOptions) => {
  try {
     const templatePath = path.resolve(
      process.cwd(),
      `src/templates/${templateName}.ejs`,
    );

    const td = templateData as Record<string, unknown>;
    const expiresVal =
      td && Object.prototype.hasOwnProperty.call(td, "expiresInMinutes")
        ? td["expiresInMinutes"]
        : undefined;
    const expiresInMinutes = typeof expiresVal === "number" ? expiresVal : 5;

    const templateDataWithDefaults: Record<string, unknown> = {
      appName: envVars.APP_NAME ?? "Your App",
      supportEmail: envVars.EMAIL_SENDER.SMTP_FROM ?? "support@example.com",
      year: new Date().getFullYear(),
      expiresInMinutes,
      ...td,
    };

    const html = await ejs.renderFile(templatePath, templateDataWithDefaults);

    await transporter.sendMail({
      from: envVars.EMAIL_SENDER.SMTP_FROM,
      to: to,
      subject: subject,
      html: html,
      attachments: attachments?.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        contentType: attachment.contentType,
      })),
    });
  } catch {
    throw new AppError(status.INTERNAL_SERVER_ERROR, `Failed to send email to ${to}`);
  }
};
