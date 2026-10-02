import nodemailer from "nodemailer";
const isPlaceholder = (value) =>
  !value || /^(your_|actual_)/i.test(value);

export const sendEmail = async ({ to, subject, html, attachments }) => {
  const smtpUser = process.env.BREVO_SMTP_USER;
  const smtpKey = process.env.BREVO_SMTP_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const smtpHost = process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com";
  const smtpPort = Number(process.env.BREVO_SMTP_PORT || 587);

  if (isPlaceholder(smtpUser) || isPlaceholder(smtpKey) || isPlaceholder(senderEmail)) {
    throw new Error(
      "Email delivery is not configured. Set BREVO_SMTP_USER, BREVO_SMTP_KEY, and BREVO_SENDER_EMAIL to real Brevo values in backend/.env, then restart the backend."
    );
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpKey,
    },
  });

  return await transporter.sendMail({
    from: `"UPTOSKILL" <${senderEmail}>`,
    to,
    subject,
    html,
    ...(attachments?.length ? { attachments } : {}),
  });
};