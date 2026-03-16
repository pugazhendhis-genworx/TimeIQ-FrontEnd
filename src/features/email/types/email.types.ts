/* ──────────────────────────────────────────────
 *  Email domain types – mirrors backend schemas
 *  Backend: src/schemas/email_schemas.py
 * ────────────────────────────────────────────── */

export interface EmailAttachment {
  attachment_id: string;
  file_name: string;
  file_type: string;
  file_path: string;
}

export interface EmailMessage {
  email_message_id: string;
  thread_id: string;
  message_id: string;
  sender_email: string;
  subject: string | null;
  body: string | null;
  received_at: string;
  is_reply: boolean | null;
  processed_status: string | null;
  classification: string | null;
  attachments: EmailAttachment[];
}

export interface EmailState {
  emails: EmailMessage[];
  timesheetEmails: EmailMessage[];
  emailsLoading: boolean;
  timesheetEmailsLoading: boolean;
  processing?: boolean;
  reprocessing?: boolean;
  error: string | null;
}

