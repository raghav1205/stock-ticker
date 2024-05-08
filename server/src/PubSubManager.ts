import {  RedisClientType, createClient } from "redis";
import WebSocket from "ws";

interface StockValue {
    [key: string]: string
}

interface StockObjInterface {
    [key: string]: {
        values: StockValue[]
    }
}

class PubSubManager {

    private static instance: PubSubManager;
    private redisClient: RedisClientType
    private subscribers: Map<string, Set<WebSocket>>;

    private constructor() {
        this.redisClient = createClient({
            socket: {
                host: 'redis',
                port: 6379
              },
        });
        try {
            this.redisClient.on("error", (error) => {
                console.error(`Redis client error: ${error}`);
            });
        } catch (error) {
            console.error(`Error creating Redis client: ${error}`);
        }
        this.redisClient.connect();
        this.subscribers = new Map<string, Set<WebSocket>>();
    }

    public static getInstance(): PubSubManager {
        if (!PubSubManager.instance) {
            PubSubManager.instance = new PubSubManager();
        }

        return PubSubManager.instance;
    }

    public addUser(symbol: string, ws: WebSocket): void {
        if (!this.subscribers.has(symbol)) {
            console.log(`Adding user to ${symbol}`);
            this.subscribers.set(symbol, new Set());
        }

        this.subscribers.get(symbol)!.add(ws);
        console.log(`Added user to ${symbol}. Total subscriptions: ${this.subscribers.get(symbol)!.size}`);


        //subscribe redis client if this is the first subscriber
        if (this.subscribers.get(symbol)!.size === 1) {
            console.log(`Subscribing to ${symbol} in Redis 1`);
            try {
                const res = this.redisClient.subscribe(symbol, (message) => {
                    // if (this.subscribers.get(symbol)) {
                    console.log(`Subscribing to ${symbol} in Redis 2`);
                    console.log(`Received message from Redis: ${message}`)
                    this.subscribers.get(symbol)!.forEach((subscriber) => {
                        const stockInfo = JSON.parse(message);
                        const stockObj: StockObjInterface = {}
                        Object.keys(stockInfo).forEach((key) => {
                            if (typeof key === 'string') {
                                stockObj[key] = { values: [] }
                                stockObj[key].values = stockInfo[key].values
                            }
                        })

                        subscriber.send(JSON.stringify(stockObj));
                    });
                    // }
                });

                res.then(() => {
                    console.log(`Subscribed to ${symbol}. Total subscriptions: ${res}`);
                }).catch((error) => {
                    console.error(`Error subscribing to Redis: ${error}`);
                });
            } catch (error) {
                console.error(`Error subscribing to Redis: ${error}`);
            }
        }
    }

    public removeUser(symbol: string, ws: WebSocket): void {
        if (this.subscribers.has(symbol)) {
            this.subscribers.get(symbol)!.delete(ws);

            if (this.subscribers.get(symbol)!.size === 0) {
                this.redisClient.unsubscribe(symbol);
            }
        }
    }

    public publish(symbol: string, message: any): void {

        console.log(`Publishing message to ${symbol}: ${JSON.stringify(message)}`);

        this.redisClient.publish(symbol, JSON.stringify(message)).then((res) => {
            console.log(`Published message to ${symbol}. Total subscriptions: ${res}`);
        }
        ).catch((error) => {
            console.error(`Error publishing to Redis: ${error}`);
        });
    }
}

export default PubSubManager.getInstance();