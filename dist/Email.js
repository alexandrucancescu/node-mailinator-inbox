"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Email {
    constructor(mailinator) {
        this.mailinatorMail = mailinator;
        this.id = mailinator.id;
        this.time = mailinator.time;
        this.subject = mailinator.subject;
        this.fromEmail = mailinator.fromfull;
        this.fromName = mailinator.from;
        this.links = mailinator.clickablelinks;
        if (mailinator.parts.length > 1) {
            this.textBody = mailinator.parts[0].body;
            this.htmlBody = mailinator.parts[1].body;
        }
        else {
            this.htmlBody = mailinator.parts[0].body;
        }
    }
    get date() {
        return new Date(this.time);
    }
}
exports.default = Email;
//# sourceMappingURL=Email.js.map