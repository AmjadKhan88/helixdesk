import type { Role, TicketPriority, TicketStatus } from "@/lib/constants";

export type Person = { id: string; name: string; email: string | null };
export type CategoryRef = { id: string; name: string; slug: string };

export type TicketItem = {
  id: string;
  number: number;
  code: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  preview: string;
  messageCount: number;
  lastMessageAt: string;
  createdAt: string;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  assignee: Person | null;
  category: CategoryRef | null;
  requester: Person & { portal: "active" | "invited" | "none" };
};

export type Attachment = {
  name: string;
  url: string;
  size: number;
  mimeType: string;
};

export type MessageItem = {
  id: string;
  body: string;
  isInternal: boolean;
  attachments: Attachment[];
  createdAt: string;
  author: { id: string; name: string; role: Role };
};

export type TicketDetailData = { ticket: TicketItem; messages: MessageItem[] };
export type TicketPage = {
  items: TicketItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
export type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: Role;
};
export type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};
