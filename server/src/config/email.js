import nodemailer from 'nodemailer';

let transporter = null;

export const getEmailTransporter = async () => {
  if (transporter) return transporter;

  const hasSmtpConfig =
    Boolean(process.env.SMTP_HOST) &&
    Boolean(process.env.SMTP_USER) &&
    process.env.SMTP_USER !== 'your_smtp_username';

  if (hasSmtpConfig) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    console.log('[Email] Configured with custom SMTP host:', process.env.SMTP_HOST);
  } else {
    // In development without SMTP credentials, use json/test transport or Ethereal
    console.log('[Email] No SMTP credentials provided. Using development console / preview transport.');
    transporter = nodemailer.createTransport({
      jsonTransport: true
    });
  }

  return transporter;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  const mailer = await getEmailTransporter();
  const from = process.env.SMTP_FROM || '"WeDate Community" <noreply@campus.edu>';

  const mailOptions = {
    from,
    to,
    subject,
    text: text || html.replace(/<[^>]+>/g, ''),
    html
  };

  const info = await mailer.sendMail(mailOptions);
  if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_USER) {
    console.log(`\n======================================================`);
    console.log(`[DEV EMAIL SENT] To: ${to} | Subject: ${subject}`);
    console.log(`Content:\n${text || html}`);
    console.log(`======================================================\n`);
  }
  return info;
};
