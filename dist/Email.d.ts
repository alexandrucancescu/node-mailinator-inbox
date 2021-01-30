import { MailinatorEmail } from "./Types";
export default class Email {
    readonly id: string;
    readonly time: number;
    readonly subject: string;
    readonly fromEmail: string;
    readonly fromName: string;
    readonly textBody?: string;
    readonly htmlBody: string;
    readonly links: string[];
    readonly mailinatorMail: MailinatorEmail;
    constructor(mailinator: MailinatorEmail);
    get date(): Date;
}
