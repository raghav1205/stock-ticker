"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const PubSubManager_1 = __importDefault(require("./PubSubManager"));
const express_1 = __importDefault(require("express"));
const node_cron_1 = __importDefault(require("node-cron"));
const STOCK_API_URL = 'https://api.twelvedata.com/';
const STOCK_API_KEY = "dc4c193ed5c64a8aa377117e9a69947d";
const app = (0, express_1.default)();
const PORT = 4000;
const publishStockPrice = (symbols) => __awaiter(void 0, void 0, void 0, function* () {
    // I want date in mm/dd/yyyy format the timezone is UTC
    const today = new Date();
    const start_date = `${today.getUTCMonth() + 1}/${today.getUTCDate() - 1}/${today.getUTCFullYear()}`;
    const end_date = `${today.getUTCMonth() + 1}/${today.getUTCDate()}/${today.getUTCFullYear()}`;
    console.log(start_date, end_date);
    try {
        const symbolString = symbols.join(',');
        const url = `${STOCK_API_URL}time_series?symbol=${symbolString}&interval=1min&format=JSON&start_date=${start_date}&end_date=${end_date}%&apikey=${STOCK_API_KEY}`;
        const response = yield axios_1.default.get(url);
        console.log(response.data);
        for (const symbol of symbols) {
            PubSubManager_1.default.publish(symbol, response.data);
        }
    }
    catch (error) {
        console.error(`Error fetching stock price: ${error}`);
    }
});
const stockList = ['AAPL', 'GOOGL'];
node_cron_1.default.schedule('*/1 * * * *', () => {
    publishStockPrice(stockList);
});
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
