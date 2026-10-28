export const ROLES = ["admin", "agent", "customer"] as const;
export const TICKET_STATUSES = ["open", "in_progress", "resolved"] as const;
export const TICKET_PRIORITIES = ["urgent", "high", "low"] as const;

export type Role = (typeof ROLES)[number];
export type TicketStatus = (typeof TICKET_STATUSES)[number];
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];