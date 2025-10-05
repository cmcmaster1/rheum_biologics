import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const MAIL_FROM = process.env.MAIL_FROM || 'no-reply@rheumai.com';
const MAIL_TO = process.env.MAIL_TO || 'admin@rheumai.com';

let transporter: any | null = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!SMTP_HOST || !SMTP_PORT) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // common default
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    connectionTimeout: 5000,
    socketTimeout: 8000
  });

  return transporter;
}

export type FeedbackType = 'bug' | 'feature' | 'new_medication' | 'new_indication';

export async function sendFeedbackEmail(params: {
  type: FeedbackType;
  message: string;
  contact?: string;
  meta?: Record<string, any>;
}) {
  const { type, message, contact, meta } = params;
  const subject = `[RheumAI Feedback] ${type.replace('_', ' ')}`;
  const text = [
    `Type: ${type}`,
    contact ? `Contact: ${contact}` : undefined,
    '---',
    message,
    '---',
    meta ? `Meta: ${JSON.stringify(meta, null, 2)}` : undefined
  ]
    .filter(Boolean)
    .join('\n');

  const tx = getTransporter();

  if (!tx) {
    // Graceful degrade: log to console for environments without SMTP
    console.warn('[emailService] No SMTP configured; feedback email not sent.');
    console.info('[emailService] To:', MAIL_TO);
    console.info('[emailService] Subject:', subject);
    console.info('[emailService] Body:', text);
    return { queued: false };
  }

  await tx.sendMail({ from: MAIL_FROM, to: MAIL_TO, subject, text, replyTo: contact });
  return { queued: true };
}
