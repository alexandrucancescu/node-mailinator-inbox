"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Safari/605.1.15";
exports.default = {
    INDEX_EP: "https://www.mailinator.com",
    FETCH_EP: "https://www.mailinator.com/fetch_email?msgid=$EMAIL_ID&zone=public",
    WS_EP: "wss://www.mailinator.com/ws/fetchinbox?zone=public&query=",
    USER_AGENT,
    INDEX_HEADERS: {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
};
//# sourceMappingURL=Config.js.map