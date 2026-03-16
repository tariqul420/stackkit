import nodemailer from "nodemailer";
{{#if framework == "express"}}
import ejs from "ejs";
import status from "http-status";
import path from "path";
import { envVars } from "../../config/env";
import { AppError } from "../errors/app-error";
{{/if}}
{{#if framework == "nextjs"}}
import { renderEmailTemplate } from "../email/otp-template";
import { envVars } from "../env";
{{/if}}

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
    {{#if framework == "express"}}
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
      supportEmail: envVars.SUPER_ADMIN_EMAIL ?? "support@example.com",
      year: new Date().getFullYear(),
      expiresInMinutes,
      ...td,
    };

    const html = await ejs.renderFile(templatePath, templateDataWithDefaults);
    {{/if}}
    {{#if framework == "nextjs"}}
    const html = renderEmailTemplate(templateName, templateData);
    {{/if}}

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
    {{#if framework == "express"}}
    throw new AppError(status.INTERNAL_SERVER_ERROR, `Failed to send email to ${to}`);
    {{else}}
    throw new Error(`Failed to send email to ${to}`);
    {{/if}}
  }
};
