import {MailinatorEmail} from "./Types";

export default class Email {
	public readonly id: string;
	public readonly time: number;
	public readonly subject: string;
	public readonly fromEmail: string;
	public readonly fromName: string;
	public readonly textBody?: string;
	public readonly htmlBody: string;
	public readonly links: string[];

	public readonly mailinatorMail: MailinatorEmail;

	constructor(mailinator: MailinatorEmail) {
		this.mailinatorMail = mailinator;
		this.id = mailinator.id;
		this.time = mailinator.time;
		this.subject = mailinator.subject;
		this.fromEmail = mailinator.fromfull;
		this.fromName = mailinator.from;
		this.links = mailinator.clickablelinks;

		if(mailinator.parts.length > 1){
			this.textBody = mailinator.parts[0].body;
			this.htmlBody = mailinator.parts[1].body;
		}else{
			this.htmlBody = mailinator.parts[0].body;
		}
	}

	public get date(): Date {
		return new Date(this.time);
	}
}