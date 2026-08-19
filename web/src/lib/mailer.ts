import "server-only";

import { createTransport, type Transporter } from "nodemailer";

/**
 * Transactional email sender with two pluggable transports, checked in order:
 *
 *  1. SMTP via nodemailer (configure with RESET_SMTP_*).
 *  2. Generic HTTP email API (e.g. Resend, configured with RESET_EMAIL_*).
 *
 * Returns false when no transport is configured so callers can fall back to
 * their non-production delivery path.
 */

type MailOpts = {
  to: string;
  subject: string;
  html: string;
};

const FROM_DEFAULT = "Enactus ISIMG <no-reply@enactus-isimg.tn>";
const FROM = process.env.RESET_EMAIL_FROM || FROM_DEFAULT;

let smtpTransport: Transporter | null = null;

function getSmtp(): Transporter | null {
  const host = process.env.RESET_SMTP_HOST;
  if (!host) return null;
  if (smtpTransport) return smtpTransport;

  smtpTransport = createTransport({
    host,
    port: Number(process.env.RESET_SMTP_PORT || 587),
    secure: process.env.RESET_SMTP_SECURE === "true",
    auth: process.env.RESET_SMTP_USER
      ? {
          user: process.env.RESET_SMTP_USER,
          pass: process.env.RESET_SMTP_PASS,
        }
      : undefined,
    tls: {
      rejectUnauthorized: process.env.RESET_SMTP_REJECT_UNAUTHORIZED !== "false",
    },
  });
  return smtpTransport;
}

async function sendHttp(opts: MailOpts): Promise<boolean> {
  const apiUrl = process.env.RESET_EMAIL_API_URL;
  const apiToken = process.env.RESET_EMAIL_API_TOKEN;
  if (!apiUrl || !apiToken) return false;

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
    }),
  });
  return res.ok;
}

async function sendSmtp(opts: MailOpts): Promise<boolean> {
  const transport = getSmtp();
  if (!transport) return false;
  try {
    await transport.sendMail({
      from: FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    });
    return true;
  } catch (error) {
    console.error("[mailer] SMTP delivery failed:", error);
    return false;
  }
}

export async function sendEmail(opts: MailOpts): Promise<boolean> {
  if (process.env.RESET_SMTP_HOST) return sendSmtp(opts);
  return sendHttp(opts);
}

export async function sendPasswordResetEmail(opts: {
  to: string;
  resetUrl: string;
}): Promise<boolean> {
  const html = [
    `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">`,
    `<h2 style="color:#0A0A0A">Reset your password</h2>`,
    `<p style="color:#444">We received a request to reset your Enactus ISIMG account password.`,
    ` This link is valid for one hour and can only be used once.</p>`,
    `<p><a href="${opts.resetUrl}" style="display:inline-block;background:#FFC222;color:#0A0A0A;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold">Reset password</a></p>`,
    `<p style="color:#999;font-size:12px">If you didn't request this, you can safely ignore this email.</p>`,
    `</div>`,
  ].join("\n");

  return sendEmail({
    to: opts.to,
    subject: "Reset your Enactus ISIMG password",
    html,
  });
}