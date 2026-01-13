export const getVerificationEmailTemplate = (user: { name?: string; email: string }, url: string) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #000; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; }
    .header { padding: 20px; text-align: center; border-bottom: 1px solid #000; }
    .content { padding: 20px; }
    .button { display: inline-block; background-color: #fff; color: #000; padding: 10px 20px; text-decoration: none; border: 1px solid #000; border-radius: 5px; margin: 20px 0; }
    .footer { font-size: 12px; color: #000; text-align: center; margin-top: 20px; border-top: 1px solid #000; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Verify Your Email Address</h1>
  </div>
  <div class="content">
    <p>Hi ${user.name || user.email},</p>
    <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
    <a href="${url}" class="button">Verify Email</a>
    <p>If the button doesn't work, copy and paste this link: <a href="${url}">${url}</a></p>
    <p>This link expires in 24 hours.</p>
  </div>
  <div class="footer">
    <p>If you didn't create an account, ignore this email.</p>
  </div>
</body>
</html>
  `;

  const text = `Hi ${user.name || user.email},

Thank you for signing up. Please verify your email address by clicking this link: ${url}

This link expires in 24 hours.

If you didn't create an account, ignore this email.`;

  return { html, text };
};

export const getPasswordResetEmailTemplate = (user: { name?: string; email: string }, url: string) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #000; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; }
    .header { padding: 20px; text-align: center; border-bottom: 1px solid #000; }
    .content { padding: 20px; }
    .button { display: inline-block; background-color: #fff; color: #000; padding: 10px 20px; text-decoration: none; border: 1px solid #000; border-radius: 5px; margin: 20px 0; }
    .footer { font-size: 12px; color: #000; text-align: center; margin-top: 20px; border-top: 1px solid #000; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Reset Your Password</h1>
  </div>
  <div class="content">
    <p>Hi ${user.name || user.email},</p>
    <p>You requested a password reset. Click the link below to reset your password.</p>
    <a href="${url}" class="button">Reset Password</a>
    <p>If the button doesn't work, copy and paste this link: <a href="${url}">${url}</a></p>
    <p>This link expires in 1 hour.</p>
  </div>
  <div class="footer">
    <p>If you didn't request this, ignore this email.</p>
  </div>
</body>
</html>
  `;

  const text = `Hi ${user.name || user.email},

You requested a password reset. Click this link to reset your password: ${url}

This link expires in 1 hour.

If you didn't request this, ignore this email.`;

  return { html, text };
};