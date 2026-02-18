interface OtpTemplateProps {
  name?: string | null;
  otp: string;
}

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const renderOtpTemplate = ({ name, otp }: OtpTemplateProps) => {
  const safeName = name ? escapeHtml(name) : null;
  const safeOtp = escapeHtml(otp);

  return `<html>
      <body
        style="margin:0;padding:24px;background-color:#f8fafc;font-family:Arial,sans-serif;color:#0f172a;"
      >
        <table
          role="presentation"
          width="100%"
          cellpadding="0"
          cellspacing="0"
          style="max-width:560px;margin:0 auto;background:#ffffff;"
        >
          <tbody>
            <tr>
              <td style="padding:28px 24px;">
                <h2 style="margin:0 0 12px;font-size:22px;">Verification Code</h2>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
                  ${safeName ? `Hi ${safeName},` : "Hi,"}
                </p>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
                  Use the OTP below to continue. This code will expire in 2 minutes.
                </p>
                <div
                  style="display:inline-block;padding:12px 18px;border:1px solid #e2e8f0;border-radius:8px;letter-spacing:6px;font-size:22px;font-weight:700;background-color:#f1f5f9;"
                >
                  ${safeOtp}
                </div>
                <p style="margin:20px 0 0;font-size:13px;color:#475569;">
                  If you did not request this code, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>`;
};

export const renderEmailTemplate = (
  templateName: string,
  templateData: Record<string, unknown>,
) => {
  switch (templateName) {
    case "otp": {
      const name =
        typeof templateData.name === "string" ? templateData.name : null;
      const otp = typeof templateData.otp === "string" ? templateData.otp : "";

      if (!otp) {
        throw new Error("OTP value is required for otp template");
      }

      return `<!DOCTYPE html>${renderOtpTemplate({ name, otp })}`;
    }
    default:
      throw new Error(`Unknown email template: ${templateName}`);
  }
};
