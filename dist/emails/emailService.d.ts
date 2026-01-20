interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
}
/**
 * Send Email Helper
 */
export declare const sendEmail: ({ to, subject, html, }: SendEmailOptions) => Promise<void>;
export {};
