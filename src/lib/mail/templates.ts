const BRAND = "#12665a";

export const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const excerpt = (body: string, max = 280) => {
  const flat = body.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
};

type Block = {
  preheader: string;
  heading: string;
  paragraphs: string[];
  quote?: string;
  cta?: { label: string; url: string };
  footer?: string;
};

function layout(b: Block) {
  const html = `<!doctype html><html><body style="margin:0;background:#f4f5f2;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#141a17">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(b.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
<tr><td style="padding:0 4px 16px;font-size:15px;font-weight:600">HelixDesk</td></tr>
<tr><td style="background:#ffffff;border:1px solid #e1e4de;border-radius:14px;padding:28px">
<h1 style="margin:0 0 14px;font-size:20px;line-height:1.3">${esc(b.heading)}</h1>
${b.paragraphs.map((p) => `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#4a5651">${esc(p)}</p>`).join("")}
${b.quote ? `<blockquote style="margin:0 0 14px;padding:10px 14px;border-left:3px solid ${BRAND};background:#f4f5f2;font-size:14px;line-height:1.55;color:#141a17">${esc(b.quote)}</blockquote>` : ""}
${
  b.cta
    ? `<p style="margin:22px 0 6px"><a href="${esc(b.cta.url)}" style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:11px 20px;border-radius:9px">${esc(b.cta.label)}</a></p>
<p style="margin:12px 0 0;font-size:12px;line-height:1.5;color:#65716a;word-break:break-all">${esc(b.cta.url)}</p>`
    : ""
}
</td></tr>
<tr><td style="padding:16px 4px;font-size:12px;line-height:1.5;color:#65716a">${esc(b.footer ?? "")}</td></tr>
</table></td></tr></table></body></html>`;

  const text = [
    b.heading,
    "",
    ...b.paragraphs,
    ...(b.quote ? ["", `> ${b.quote}`] : []),
    ...(b.cta ? ["", `${b.cta.label}: ${b.cta.url}`] : []),
    ...(b.footer ? ["", b.footer] : []),
  ].join("\n");

  return { html, text };
}

const first = (name: string) => name.split(" ")[0] || name;
const ignore = "If you were not expecting this email, you can ignore it.";

export const inviteEmail = (p: {
  name: string;
  role: string;
  url: string;
}) => ({
  subject: "You are invited to HelixDesk",
  ...layout({
    preheader: "Set your password to join the team.",
    heading: `Welcome, ${first(p.name)}`,
    paragraphs: [
      `You have been invited to join the team on HelixDesk as ${p.role === "admin" ? "an admin" : "an agent"}.`,
      "Choose a password to activate your account. The link works once and expires in 7 days.",
    ],
    cta: { label: "Set your password", url: p.url },
    footer: ignore,
  }),
});

export const portalInviteEmail = (p: { name: string; url: string }) => ({
  subject: "Access your HelixDesk support portal",
  ...layout({
    preheader: "Choose a password to follow your support requests.",
    heading: `Hi ${first(p.name)}`,
    paragraphs: [
      "Our support team set up a portal where you can follow your requests and reply to us.",
      "Choose a password to get started. The link works once and expires in 7 days.",
    ],
    cta: { label: "Set your password", url: p.url },
    footer: ignore,
  }),
});

export const passwordEmail = (p: {
  name: string;
  url: string;
  kind: "reset" | "signup";
  hours: number;
}) => ({
  subject:
    p.kind === "reset"
      ? "Reset your HelixDesk password"
      : "Confirm your email for HelixDesk",
  ...layout({
    preheader:
      p.kind === "reset"
        ? "Use this link to choose a new password."
        : "Confirm your email to finish creating your account.",
    heading: p.kind === "reset" ? "Reset your password" : "Confirm your email",
    paragraphs: [
      `Hi ${first(p.name)},`,
      p.kind === "reset"
        ? "We received a request to reset your password. Choose a new one with the button below."
        : "Confirm your email address and choose a password to finish creating your account.",
      `The link works once and expires in ${p.hours} ${p.hours === 1 ? "hour" : "hours"}.`,
    ],
    cta: {
      label: p.kind === "reset" ? "Choose a new password" : "Set your password",
      url: p.url,
    },
    footer: ignore,
  }),
});

export const replyToCustomerEmail = (p: {
  customerName: string;
  agentName: string;
  code: string;
  subject: string;
  body: string;
  files: number;
  url: string;
  setupUrl?: string;
}) => ({
  subject: `[${p.code}] ${p.subject}`,
  ...layout({
    preheader: `${p.agentName} replied to your request.`,
    heading: `${p.agentName} replied to your request`,
    paragraphs: [
      `Hi ${first(p.customerName)}, here is the latest on “${p.subject}”.`,
    ],
    quote:
      excerpt(p.body) ||
      (p.files
        ? `${p.files} attachment${p.files === 1 ? "" : "s"}`
        : undefined),
    cta: p.setupUrl
      ? { label: "Set up portal access to reply", url: p.setupUrl }
      : { label: "Open the conversation", url: p.url },
    footer: p.setupUrl
      ? "Choose a password to read the full conversation and reply. The link expires in 72 hours."
      : "Reply from the portal to keep everything in one place.",
  }),
});

export const customerRepliedEmail = (p: {
  agentName: string;
  customerName: string;
  code: string;
  subject: string;
  body: string;
  files: number;
  url: string;
}) => ({
  subject: `[${p.code}] New reply from ${p.customerName}`,
  ...layout({
    preheader: `${p.customerName} replied on ${p.code}.`,
    heading: `${p.customerName} replied`,
    paragraphs: [
      `Hi ${first(p.agentName)}, there is a new reply on “${p.subject}” (${p.code}).`,
    ],
    quote:
      excerpt(p.body) ||
      (p.files
        ? `${p.files} attachment${p.files === 1 ? "" : "s"}`
        : undefined),
    cta: { label: "Open the ticket", url: p.url },
    footer: "You get this because the ticket is assigned to you.",
  }),
});

export const resolvedEmail = (p: {
  name: string;
  code: string;
  subject: string;
  url: string;
  setupUrl?: string;
}) => ({
  subject: `[${p.code}] Resolved: ${p.subject}`,
  ...layout({
    preheader: "Your request was marked as resolved.",
    heading: "Your request was resolved",
    paragraphs: [
      `Hi ${first(p.name)}, we marked “${p.subject}” (${p.code}) as resolved.`,
      "If something is still wrong, reply in the portal and we will pick it back up.",
    ],
    cta: p.setupUrl
      ? { label: "Set up portal access", url: p.setupUrl }
      : { label: "View the request", url: p.url },
  }),
});
