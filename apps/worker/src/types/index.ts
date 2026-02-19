export type gmail_type = {
  sender_app_pass: string;
  sender_email: string;
  recever_email: string;
  message: string;
  subject: string;
};

export type object_type_for_email = {
  sender_email: string;
  app_password: string;
  message: string;
  receiver_email: string;
  subject: string;
  stepes_run_id: number;
  stage: number;
};

export type object_type_for_telegram = {
  token: string;
  chat_id: number;
  message: object;
};

export type receive_email_type = {
  stepes_run_id: number;
};

export interface MessageFromProcessorReceiveEvent {
  type: 'MESSAGE_FROM_PROECSSOR_RECEIVE';
  run: {
    attachments: Attachment[];
    bcc: string[];
    cc: string[];
    created_at: string; 
    email_id: string;   
    from: string;
    message_id: string;
    subject: string;
    to: string[];
  };
}

export interface Attachment {
  filename?: string;
  contentType?: string;
  size?: number;
  url?: string;
}
