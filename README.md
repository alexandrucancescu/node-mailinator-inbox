# Node mailinator client

Mailinator client library for nodejs. Access a public disposable
email inbox, based on a username, and read emails. Does not require
an API key.

## Installation

```shell script
npm install --save mailinator-inbox
```

## Usage

```typescript
import {Inbox} from "mailinator-inbox"

//Access the inbox of johnny@mailinator.com
const inbox = new Inbox("johnny");

//Load emails
await inbox.refresh();

//Get the header ( from, subject, ...) of the first email
const firstEmailHeader = inbox.emailHeaders[0];

//Retrieve the whole email, including body
const firstEmail = await inbox.getEmail(firstEmailHeader.id);

//Waits for new emails from ana@gmail.com
const futureEmails = await inbox.waitForEmailsFrom("ana@gmail.com", 15000);

//Iterate over the headers of the new emails from ana
futureEmails.foreach(async (emailInfo) => {
	const email = await inbox.getEmail(emailInfo.id);
	
	console.log("From Ana:", email.subject, email.textBody)
})
```

## API

### **Class Inbox**

### new Inbox(username: string)

Creates a new inbox for the given username

### emailHeaders: EmailInfo[]

Array with the headers of all the emails in the inbox. These are
not the full email, only metadata. You need to call **getEmail()**
to load the body and any additional data.

### .refresh()
#### **ASYNC**

Obligatory to call before trying to access emails, as this
loads the initial email headers. You can call this anytime
to refresh the inbox with new emails.

### .getEmail(id: string): Email

Retrieves the whole email with the given id. Use the id from
**emailHeaders**.

### .getEmailsFrom(address: string): EmailHeader[]

Return a list of all the email headers from the specified address.
Does not refresh the emails.

### .waitForEmailsFrom(address: string, timeout: number): Promise<EmailHeader[]>
#### **ASYNC**

Poll for new emails from the given address. Waits until timeout runs out.
Returns after the first encounter of a new mail.
Returns a list because there may be multiple new emails.

Returns the new email headers or **null** if timed out.

### **EmailHeader**

```typescript
interface EmailHeader {
	id: string;
	subject: string;
	//Email address that sent the email johnnydoe@gmail.com
	fromEmail: string;
	//Johhny Doe
	fromName: string;
	//Epoch time when email was received
	time: number;

	//Raw email heaeder as received from mailinator
	mailinatorHeader: MailinatorEmailHeader;
}
```


### **Email**

```typescript
class Email {
	id: string;
	subject: string;
	//Epoch time when mail was received
	time: number;
	//Email address that sent the email johhnydoe@gmail.com
	fromEmail: string;
	//Johhny Doe
	fromName: string;
	//Email body as text, not always present
	textBody?: string;
	//Email body as HTML
	htmlBody: string;
	//All the URL links from the email
	links: string[];

	//Raw email object as received from mailinator
	mailinatorMail: MailinatorEmail;
}
```