import "server-only";
import nodemailer from "nodemailer";

export type MailMessage = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export const mailEnabled = () =>
  ["smtp", "resend"].includes(process.env.EMAIL_DRIVER ?? "");

function env(name: string) {
  const v = process.env[name];
  if (!v)
    throw new Error(
      `${name} is required for EMAIL_DRIVER=${process.env.EMAIL_DRIVER}`,
    );
  return v;
}

const from = () =>
  process.env.EMAIL_FROM || "HelixDesk <onboarding@resend.dev>";

let transporter: nodemailer.Transporter | undefined;

export async function sendMail(m: MailMessage) {
  switch (process.env.EMAIL_DRIVER) {
    case "resend": {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env("RESEND_API_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: from(),
          to: m.to,
          subject: m.subject,
          html: m.html,
          text: m.text,
        }),
      });
      if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
      return;
    }
    case "smtp": {
      transporter ??= nodemailer.createTransport({
        host: env("SMTP_HOST"),
        port: Number(process.env.SMTP_PORT ?? 465),
        secure: (process.env.SMTP_SECURE ?? "true") === "true",
        auth: { user: env("SMTP_USER"), pass: env("SMTP_PASS") },
      });
      await transporter.sendMail({
        from: from(),
        to: m.to,
        subject: m.subject,
        html: m.html,
        text: m.text,
      });
      return;
    }
    default:
      // Development: the whole email, links included, appears in the terminal
      console.log(
        `\n[mail:console] To: ${m.to}\nSubject: ${m.subject}\n\n${m.text}\n`,
      );
  }
}
