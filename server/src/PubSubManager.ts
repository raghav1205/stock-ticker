import { RedisClientType, createClient } from "redis";
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
    private redisClientCache: RedisClientType
    private subscribers: Map<string, Set<WebSocket>>;
    // private latestDataCache: StockObjInterface

    private constructor() {
        this.redisClient = createClient({
            url: 'redis://redis:6379'
        });
        this.redisClientCache = createClient({
            url: 'redis://redis:6379'
        });


        try {
            this.redisClient.on("error", (error) => {
                console.error(`Redis client error: ${error}`);
            });
            this.redisClientCache.on("error", (error) => {
                console.error(`Redis client error: ${error}`);
            });
        } catch (error) {
            console.error(`Error creating Redis client: ${error}`);
        }
        this.redisClient.connect();
        this.redisClientCache.connect();
        this.subscribers = new Map<string, Set<WebSocket>>();
        // this.latestDataCache = {}
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

        // send data from cache initially
        // if (this.latestDataCache[symbol]) {
        //     ws.send(JSON.stringify(this.latestDataCache[symbol]));
        // }



        //subscribe redis client if this is the first subscriber
        if (this.subscribers.get(symbol)!.size === 1) {
            // console.log(`Subscribing to ${symbol} in Redis 1`);
            try {
                const res = this.redisClient.subscribe(symbol, (message) => {
                    // if (this.subscribers.get(symbol)) {
                    // console.log(`Subscribing to ${symbol} in Redis 2`);
                    // console.log(`Received message from Redis: ${message}`)
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

        console.log(`Publishing message to ${symbol}`);

        this.redisClient.publish(symbol, JSON.stringify(message)).then((res) => {
            console.log(`Published message to ${symbol}. Total subscriptions: ${res}`);
        }).catch((error) => {
            console.error(`Error publishing to Redis: ${error}`);
        });
    }

    public async addDataToCache(symbol: string, data: any) {
        console.log(`Adding data to cache for ${symbol}`);
        try {
            await this.redisClientCache.set(symbol, JSON.stringify(data));
            let cachedData = await this.redisClientCache.get(symbol); // To confirm data was added
            console.log(`current cache after adding data: ${cachedData}`);
        } catch (error) {
            console.error('Redis error:', error);
        }
    }

    public async sendDataFromCache(symbol: string, ws: WebSocket) {
        console.log(`current cache: ${await this.redisClientCache.get(symbol)}`);
        try {
            const data = await this.redisClientCache.get(symbol);
            console.log(`current cache: ${data}`);
            if (data) {
                ws.send(data);
            }
        } catch (error) {
            console.error('Redis error when sending data:', error);
        }

    }
}

export default PubSubManager.getInstance();