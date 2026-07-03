import { Resend } from "resend";

let resendClient;

function getClient() {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }

  return resendClient;
}

export async function sendEmail({ to, subject, html }) {
  const { data, error } = await getClient().emails.send({
    from: process.env.EMAIL_FROM || "Krushi Seva <onboarding@resend.dev>",
    to,
    subject,
    html
  });

  if (error) {
    throw new Error(error.message || "Failed to send email via Resend");
  }

  return data;
}