import "server-only";
import { after } from "next/server";
import type { Types } from "mongoose";
import { appUrl } from "@/lib/app-url";
import { connectDB } from "@/lib/db";
import { mailEnabled, sendMail } from "@/lib/mail";
import * as t from "@/lib/mail/templates";
import { issueResetToken, resetUrl } from "@/lib/password-reset";
import { User } from "@/models/User";

/** Runs after the response is sent. A failing email is logged and never breaks the request. */
function deliver(task: () => Promise<unknown>) {
  after(async () => {
    try {
      await task();
    } catch (err) {
      console.error("[mail] failed:", err);
    }
  });
}

// ---------- invites and password links ----------

export function emailTeamInvite(p: {
  to: string;
  name: string;
  role: string;
  url: string;
}) {
  deliver(() => sendMail({ to: p.to, ...t.inviteEmail(p) }));
  return mailEnabled();
}

export function emailPortalInvite(p: {
  to: string;
  name: string;
  url: string;
}) {
  deliver(() => sendMail({ to: p.to, ...t.portalInviteEmail(p) }));
  return mailEnabled();
}

export function emailPasswordLink(p: {
  to: string;
  name: string;
  url: string;
  kind: "reset" | "signup";
  hours: number;
}) {
  deliver(() => sendMail({ to: p.to, ...t.passwordEmail(p) }));
}

// ---------- ticket activity ----------

/** Customers who never signed in get a password-setup link, so the email is actually useful to them */
async function setupLink(user: {
  _id: Types.ObjectId;
  passwordSetAt?: Date | null;
}) {
  return user.passwordSetAt
    ? undefined
    : resetUrl(await issueResetToken(user._id, 72));
}

export function notifyCustomerOfReply(p: {
  ticketNumber: number;
  subject: string;
  requesterId: Types.ObjectId;
  authorId: string;
  body: string;
  files: number;
}) {
  deliver(async () => {
    await connectDB();
    const [customer, author] = await Promise.all([
      User.findById(p.requesterId).select(
        "name email role isActive passwordSetAt",
      ),
      User.findById(p.authorId).select("name"),
    ]);
    if (!customer?.isActive || String(customer._id) === p.authorId) return;

    await sendMail({
      to: customer.email,
      ...t.replyToCustomerEmail({
        customerName: customer.name,
        agentName: author?.name ?? "Our team",
        code: `TCK-${p.ticketNumber}`,
        subject: p.subject,
        body: p.body,
        files: p.files,
        url:
          customer.role === "customer"
            ? `${appUrl()}/portal/tickets/${p.ticketNumber}`
            : `${appUrl()}/tickets/${p.ticketNumber}`,
        setupUrl: await setupLink(customer),
      }),
    });
  });
}

export function notifyStaffOfReply(p: {
  ticketNumber: number;
  subject: string;
  assigneeId?: Types.ObjectId | null;
  authorId: string;
  body: string;
  files: number;
}) {
  if (!p.assigneeId) return; // nobody owns it yet, so nobody to notify
  const assigneeId = p.assigneeId;
  deliver(async () => {
    await connectDB();
    const [agent, author] = await Promise.all([
      User.findById(assigneeId).select("name email isActive"),
      User.findById(p.authorId).select("name"),
    ]);
    if (!agent?.isActive || String(agent._id) === p.authorId) return;

    await sendMail({
      to: agent.email,
      ...t.customerRepliedEmail({
        agentName: agent.name,
        customerName: author?.name ?? "The customer",
        code: `TCK-${p.ticketNumber}`,
        subject: p.subject,
        body: p.body,
        files: p.files,
        url: `${appUrl()}/tickets/${p.ticketNumber}`,
      }),
    });
  });
}

export function notifyResolved(p: {
  ticketNumber: number;
  subject: string;
  requesterId: Types.ObjectId;
}) {
  deliver(async () => {
    await connectDB();
    const customer = await User.findById(p.requesterId).select(
      "name email role isActive passwordSetAt",
    );
    if (!customer?.isActive) return;

    await sendMail({
      to: customer.email,
      ...t.resolvedEmail({
        name: customer.name,
        code: `TCK-${p.ticketNumber}`,
        subject: p.subject,
        url:
          customer.role === "customer"
            ? `${appUrl()}/portal/tickets/${p.ticketNumber}`
            : `${appUrl()}/tickets/${p.ticketNumber}`,
        setupUrl: await setupLink(customer),
      }),
    });
  });
}
