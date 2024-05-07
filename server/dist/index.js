"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const http_1 = __importDefault(require("http"));
const PubSubManager_1 = __importDefault(require("./PubSubManager"));
const server = http_1.default.createServer((req, res) => {
    console.log(req.url);
    res.end('okay');
});
const wss = new ws_1.default.Server({ server });
const pubSubManager = PubSubManager_1.default;
try {
    wss.on("connection", (ws) => {
        ws.on("message", (message) => {
            console.log(`Received message => ${message}`);
            ws.send(`Hello, you sent => ${message}`);
            const parsedMessage = JSON.parse(message.toString());
            if (parsedMessage.action === 'subscribe') {
                pubSubManager.addUser(parsedMessage.payload, ws);
            }
        });
        ws.on("close", () => {
            console.log("Client disconnected");
        });
        ws.send("Hello, I am a WebSocket server");
    });
}
catch (error) {
    console.error(`Error creating WebSocket server: ${error}`);
}
server.listen(8080, () => {
    console.log(`Server is running at http://localhost:8080`);
});
