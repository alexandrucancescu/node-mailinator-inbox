export interface MailinatorEmailHeader {
    id: string;
    from: string;
    fromfull: string;
    subject: string;
    time: number;
    channel: string;
    origfrom: string;
    seconds_ago: number;
}
export interface EmailHeader {
    id: string;
    fromEmail: string;
    fromName: string;
    subject: string;
    time: number;
    mailinatorHeader: MailinatorEmailHeader;
}
export interface MailinatorEmailPart {
    headers: {
        "content-transfer-encoding": string;
        "content-type": string;
    };
    body: string;
}
export interface MailinatorEmail {
    id: string;
    fromfull: string;
    origfrom: string;
    from: string;
    to: string;
    subject: string;
    ip: string;
    requestId: number;
    seconds_ago: number;
    time: number;
    clickablelinks: string[];
    headers: {
        date: string;
        subject: string;
        received: string[];
        from: string;
        to: string;
        "reply-to": string;
        "content-type": string;
    };
    parts: MailinatorEmailPart[];
}
