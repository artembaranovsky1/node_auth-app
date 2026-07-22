import 'dotenv/config';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export function send({ email, subject, html }) {
  return transporter.sendMail({ to: email, subject, html });
}

function sendActivationEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/activation/${token}`;
  const html = `
  <h1>Activate account</h1>
  <a href="${href}">${href}</a>
`;

  return send({
    email,
    html,
    subject: 'Activate',
  });
}

function sendResetEmail(email, token) {
  const href = `${process.env.CLIENT_HOST}/users/reset-email/${token}`;
  const html = `
 <h1>Reset your password</h1>
  <a href="${href}">${href}</a>`;

  return send({
    email,
    html,
    subject: 'Reset',
  });
}

function sendChangeEmailNotification(oldEmail) {
  const html = `
    <h1>Security Notification: Email Changed</h1>
    <p>The email address associated with your account was successfully changed.</p>
    <p>If you did NOT perform this action, please contact our support team immediately to secure your account.</p>
  `;

  return send({
    email: oldEmail,
    html,
    subject: 'Security Alert: Email address changed',
  });
}

export const emailService = {
  send,
  sendActivationEmail,
  sendResetEmail,
  sendChangeEmailNotification,
};
