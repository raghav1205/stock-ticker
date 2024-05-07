"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
class PubSubManager {
    constructor() {
        this.redisClient = (0, redis_1.createClient)();
        try {
            this.redisClient.on("error", (error) => {
                console.error(`Redis client error: ${error}`);
            });
        }
        catch (error) {
            console.error(`Error creating Redis client: ${error}`);
        }
        this.redisClient.connect();
        this.subscribers = new Map();
    }
    static getInstance() {
        if (!PubSubManager.instance) {
            PubSubManager.instance = new PubSubManager();
        }
        return PubSubManager.instance;
    }
    addUser(symbol, ws) {
        if (!this.subscribers.has(symbol)) {
            console.log(`Adding user to ${symbol}`);
            this.subscribers.set(symbol, new Set());
        }
        this.subscribers.get(symbol).add(ws);
        console.log(`Added user to ${symbol}. Total subscriptions: ${this.subscribers.get(symbol).size}`);
        //subscribe redis client if this is the first subscriber
        if (this.subscribers.get(symbol).size === 1) {
            console.log(`Subscribing to ${symbol} in Redis 1`);
            try {
                const res = this.redisClient.subscribe(symbol, (message) => {
                    // if (this.subscribers.get(symbol)) {
                    console.log(`Subscribing to ${symbol} in Redis 2`);
                    console.log(`Received message from Redis: ${message}`);
                    this.subscribers.get(symbol).forEach((subscriber) => {
                        const stockInfo = JSON.parse(message);
                        const stockObj = {};
                        Object.keys(stockInfo).forEach((key) => {
                            if (typeof key === 'string') {
                                stockObj[key] = { values: [] };
                                stockObj[key].values = stockInfo[key].values;
                            }
                        });
                        subscriber.send(JSON.stringify(stockObj));
                    });
                    // }
                });
                res.then(() => {
                    console.log(`Subscribed to ${symbol}. Total subscriptions: ${res}`);
                }).catch((error) => {
                    console.error(`Error subscribing to Redis: ${error}`);
                });
            }
            catch (error) {
                console.error(`Error subscribing to Redis: ${error}`);
            }
        }
    }
    removeUser(symbol, ws) {
        if (this.subscribers.has(symbol)) {
            this.subscribers.get(symbol).delete(ws);
            if (this.subscribers.get(symbol).size === 0) {
                this.redisClient.unsubscribe(symbol);
            }
        }
    }
    publish(symbol, message) {
        console.log(`Publishing message to ${symbol}: ${JSON.stringify(message)}`);
        this.redisClient.publish(symbol, JSON.stringify(message)).then((res) => {
            console.log(`Published message to ${symbol}. Total subscriptions: ${res}`);
        }).catch((error) => {
            console.error(`Error publishing to Redis: ${error}`);
        });
    }
}
exports.default = PubSubManager.getInstance();
