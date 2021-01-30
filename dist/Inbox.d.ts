import { EmailHeader } from "./Types";
import Email from "./Email";
export default class Inbox {
    readonly username: string;
    private readonly cookieJar;
    private websocket;
    private _emailHeaders;
    private wsHeaderReceived;
    private settled;
    private promiseCallbacks;
    constructor(username: string);
    refresh(): Promise<void>;
    waitForEmailsFrom(address: string, timeout?: number): Promise<EmailHeader[]>;
    getEmailsFrom(address: string): EmailHeader[];
    getEmail(id: string): Promise<Email>;
    private loadInbox;
    private createSocket;
    private rejectPromise;
    private resolvePromise;
    private messageHandler;
    private addEmailHeader;
    private getCookies;
    private hasCookie;
    get emailHeaders(): EmailHeader[];
    private get cookieString();
}
