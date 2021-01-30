"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const got_1 = require("got");
const Config_1 = require("./Config");
const tough_cookie_1 = require("tough-cookie");
const WebSocket = require("ws");
const Email_1 = require("./Email");
const Util_1 = require("./Util");
class Inbox {
    constructor(username) {
        this.username = username;
        this.cookieJar = new tough_cookie_1.CookieJar();
    }
    async refresh() {
        await this.getCookies();
        await this.loadInbox();
    }
    async waitForEmailsFrom(address, timeout = 15000) {
        const startTime = Date.now();
        const already = this.getEmailsFrom(address);
        while (Date.now() - startTime < timeout) {
            const emails = this.getEmailsFrom(address);
            const newEmails = emails.filter(em => already.findIndex(a => a.id === em.id) < 0);
            if (newEmails.length > 0) {
                return newEmails;
            }
            await Util_1.sleep(1000);
            await this.refresh();
        }
        return null;
    }
    getEmailsFrom(address) {
        return this.emailHeaders.filter(eh => eh.fromEmail === address);
    }
    async getEmail(id) {
        var _a;
        const url = Config_1.default.FETCH_EP.replace("$EMAIL_ID", id);
        try {
            const response = await got_1.default.get(url, {
                headers: {
                    "User-Agent": Config_1.default.USER_AGENT
                },
                cookieJar: this.cookieJar,
                responseType: "json"
            });
            return new Email_1.default(response.body.data);
        }
        catch (err) {
            throw new Error("Could not retrieve email. Inner error: " + ((_a = err.message) !== null && _a !== void 0 ? _a : err.toString()));
        }
    }
    async loadInbox() {
        this.settled = false;
        this.wsHeaderReceived = false;
        this._emailHeaders = [];
        return new Promise((resolve, reject) => {
            this.promiseCallbacks = { resolve, reject };
            try {
                this.createSocket();
            }
            catch (err) {
                this.rejectPromise(new Error("Could not create websocket"));
            }
        });
    }
    createSocket() {
        this.websocket = new WebSocket(`${Config_1.default.WS_EP}${this.username}`, {
            headers: {
                "User-Agent": Config_1.default.USER_AGENT,
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
    rejectPromise(error) {
        if (!this.settled) {
            this.settled = true;
            console.log("Before delete", this, this.emailHeaders);
            this._emailHeaders = null;
            if (this.websocket != null) {
                this.websocket.close();
                this.websocket = null;
            }
            this.promiseCallbacks.reject(error);
            delete this.promiseCallbacks;
        }
    }
    resolvePromise() {
        if (!this.settled) {
            this.settled = true;
            if (this.websocket != null) {
                this.websocket.close();
                this.websocket = null;
            }
            this.promiseCallbacks.resolve();
            delete this.promiseCallbacks;
        }
    }
    messageHandler(data) {
        const msg = JSON.parse(data);
        if ("fromfull" in msg) {
            this._emailHeaders.push(msg);
        }
        else if ("original_query" in msg) {
            if (this.wsHeaderReceived) {
                this.resolvePromise();
            }
            else {
                this.wsHeaderReceived = true;
            }
        }
    }
    addEmailHeader(mailinatorHeader) {
        this.emailHeaders.push({
            id: mailinatorHeader.id,
            fromEmail: mailinatorHeader.fromfull,
            fromName: mailinatorHeader.from,
            time: mailinatorHeader.time,
            subject: mailinatorHeader.subject,
            mailinatorHeader,
        });
    }
    async getCookies() {
        const resp = await got_1.default.get(Config_1.default.INDEX_EP, {
            headers: Config_1.default.INDEX_HEADERS,
            cookieJar: this.cookieJar
        });
        if (!this.hasCookie()) {
            throw new Error("Index request returned no cookie");
        }
    }
    hasCookie() {
        return this.cookieJar
            .getCookiesSync(Config_1.default.INDEX_EP)
            .some(c => c.key === "JSESSIONID");
    }
    get emailHeaders() {
        return this._emailHeaders;
    }
    get cookieString() {
        return this.cookieJar.getCookieStringSync(Config_1.default.INDEX_EP);
    }
}
exports.default = Inbox;
//# sourceMappingURL=Inbox.js.map