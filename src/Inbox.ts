import got from "got";
import Config from "./Config";
import {CookieJar} from "tough-cookie";
import * as WebSocket from "ws"
import {EmailHeader, MailinatorEmail, MailinatorEmailHeader} from "./Types";
import Email from "./Email";
import {sleep} from "./Util";

export default class Inbox {
	public readonly username: string;
	private readonly cookieJar: CookieJar;

	private websocket: WebSocket;
	private _emailHeaders: EmailHeader[];

	private wsHeaderReceived;
	private settled: boolean;
	private promiseCallbacks: {
		resolve: () 			=> void,
		reject : (err: Error) 	=> void,
	};

	constructor(username: string) {
		this.username = username;
		this.cookieJar = new CookieJar();
	}

	public async refresh() {
		await this.getCookies();
		await this.loadInbox();
	}

	public async waitForEmailsFrom(address: string | RegExp, timeout: number = 15000): Promise<EmailHeader[]> {
		const startTime = Date.now();
		const already = this.getEmailsFrom(address);
		while(Date.now() - startTime < timeout){
			const emails = this.getEmailsFrom(address);
			const newEmails = emails.filter(em => already.findIndex(a => a.id === em.id) < 0);
			if(newEmails.length > 0){
				return newEmails;
			}
			await sleep(1000);
			await this.refresh();
		}
		return null;
	}

	public getEmailsFrom(address: string | RegExp): EmailHeader[] {
		return this.emailHeaders?.filter(eh => {
			if(address instanceof RegExp){
				return address.test(eh.fromEmail);
			}else{
				return eh.fromEmail === address;
			}
		}) ?? [];
	}

	public async getEmail(id: string): Promise<Email> {
		const url = Config.FETCH_EP.replace("$EMAIL_ID", id);

		try{
			const response = await got.get(url, {
				headers: {
					"User-Agent": Config.USER_AGENT
				},
				cookieJar: this.cookieJar,
				responseType: "json"
			});

			return new Email(<MailinatorEmail>(<any>response.body).data);
		}catch (err){
			throw new Error("Could not retrieve email. Inner error: "+ (err.message ?? err.toString()));
		}
	}

	private async loadInbox(){
		this.settled = false;
		this.wsHeaderReceived = false;
		this._emailHeaders = [];
		return new Promise<void>((resolve, reject) => {
			this.promiseCallbacks = {resolve, reject};
			try{
				this.createSocket();
			}catch(err){
				this.rejectPromise(new Error("Could not create websocket"));
			}
		});
	}

	private createSocket() {
		this.websocket = new WebSocket(`${Config.WS_EP}${this.username}`, {
			headers: {
				"User-Agent": Config.USER_AGENT,
				"Cookie": this.cookieString,
			}
		});

		this.websocket.on("message", this.messageHandler.bind(this));
		this.websocket.on("error", (err) => {
			this.rejectPromise(err);
		});
		this.websocket.on("close", (code, reason) => {
			this.rejectPromise(new Error(`Websocket closed unexpectedly. Code=${code} ; Reason='${reason}'`));
		});
	}

	private rejectPromise(error: Error) {
		if(!this.settled) {
			this.settled = true;
			console.log("Before delete",this,this.emailHeaders);
			this._emailHeaders = null;
			if(this.websocket != null) {
				this.websocket.close();
				this.websocket = null;
			}
			this.promiseCallbacks.reject(error);
			delete this.promiseCallbacks;
		}
	}

	private resolvePromise() {
		if(!this.settled) {
			this.settled = true;
			if(this.websocket != null) {
				this.websocket.close();
				this.websocket = null;
			}
			this.promiseCallbacks.resolve();
			delete this.promiseCallbacks;
		}
	}

	private messageHandler(data: string) {
		const msg = JSON.parse(data);

		if("fromfull" in msg){
			this.addEmailHeader(msg);
		}else if("original_query" in msg){
			if(this.wsHeaderReceived) {
				this.resolvePromise();
			}else{
				this.wsHeaderReceived = true;
			}
		}
	}

	private addEmailHeader(mailinatorHeader: MailinatorEmailHeader) {
		this._emailHeaders.push({
			id: mailinatorHeader.id,
			fromEmail: mailinatorHeader.fromfull,
			fromName: mailinatorHeader.from,
			time: mailinatorHeader.time,
			subject: mailinatorHeader.subject,
			mailinatorHeader,
		})
	}

	private async getCookies(){
		const resp = await got.get(Config.INDEX_EP, {
			headers: Config.INDEX_HEADERS,
			cookieJar: this.cookieJar
		});

		if(!this.hasCookie()) {
			throw new Error("Index request returned no cookie");
		}
	}

	private hasCookie(): boolean {
		return this.cookieJar
			.getCookiesSync(Config.INDEX_EP)
			.some(c => c.key==="JSESSIONID");
	}

	public get emailHeaders(): EmailHeader[] {
		return this._emailHeaders;
	}

	private get cookieString(): string {
		return this.cookieJar.getCookieStringSync(Config.INDEX_EP);
	}
}