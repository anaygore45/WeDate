import { sendEmail } from '../config/email.js';

export const sendVerificationEmail = async (email, token, name = 'Student') => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationUrl = `${clientUrl}/verify-email?token=${token}`;

  const html = `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #FAF7F3; color: #252020; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #762D43; font-family: 'DM Serif Display', Georgia, serif; font-size: 28px; margin: 0;">WeDate</h1>
        <p style="color: #756B6D; font-size: 14px; margin-top: 4px;">Verified Student Community</p>
      </div>
      <div style="background: #FFFFFF; padding: 32px; border-radius: 8px; border: 1px solid #E8DFDD;">
        <h2 style="color: #252020; font-size: 20px; margin-top: 0;">Verify your campus email address</h2>
        <p style="color: #756B6D; line-height: 1.6;">Hello ${name},</p>
        <p style="color: #756B6D; line-height: 1.6;">Welcome to WeDate. To ensure our community remains exclusive and safe for verified students, please confirm your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verificationUrl}" style="background-color: #762D43; color: #FFFFFF; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Verify Email Address</a>
        </div>
        <p style="color: #756B6D; font-size: 13px; line-height: 1.5;">This verification link will expire in 24 hours. If you did not sign up for WeDate, you can safely disregard this message.</p>
        <p style="color: #756B6D; font-size: 12px; margin-top: 20px; border-top: 1px solid #E8DFDD; padding-top: 16px;">Direct link: <a href="${verificationUrl}" style="color: #762D43;">${verificationUrl}</a></p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'WeDate — Verify your campus email address',
    html
  });
};

export const sendPasswordResetEmail = async (email, token, name = 'Student') => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password?token=${token}`;

  const html = `
    <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #FAF7F3; color: #252020; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #762D43; font-family: 'DM Serif Display', Georgia, serif; font-size: 28px; margin: 0;">WeDate</h1>
      </div>
      <div style="background: #FFFFFF; padding: 32px; border-radius: 8px; border: 1px solid #E8DFDD;">
        <h2 style="color: #252020; font-size: 20px; margin-top: 0;">Reset your password</h2>
        <p style="color: #756B6D; line-height: 1.6;">Hello ${name},</p>
        <p style="color: #756B6D; line-height: 1.6;">We received a request to reset your password. Click the button below to choose a new password:</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background-color: #762D43; color: #FFFFFF; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #756B6D; font-size: 13px; line-height: 1.5;">This link is valid for 1 hour. If you did not request a password reset, your account remains secure and no action is required.</p>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: 'WeDate — Password Reset Request',
    html
  });
};
