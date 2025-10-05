import { Request, Response } from 'express';
import { z } from 'zod';
import { sendFeedbackEmail } from '../services/emailService.js';

const feedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'new_medication', 'new_indication']),
  message: z.string().min(5, 'Message is too short'),
  contact: z.string().email().optional()
});

export async function postFeedback(req: Request, res: Response) {
  const parsed = feedbackSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid feedback', errors: parsed.error.flatten() });
  }

  const { type, message, contact } = parsed.data;

  const meta = {
    ip: req.ip,
    userAgent: req.get('user-agent') || undefined,
    referer: req.get('referer') || undefined
  };

  // Do not block the response on SMTP. Queue and return 202 immediately.
  setImmediate(() => {
    sendFeedbackEmail({ type, message, contact, meta }).catch((err) => {
      console.error('[Feedback] Failed to send email:', err);
    });
  });

  return res.status(202).json({ ok: true, queued: true });
}
