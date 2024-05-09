import axios from 'axios';
import PubSubManager from './PubSubManager';
import express from 'express';
import cron from 'node-cron';

const STOCK_API_URL = 'https://api.twelvedata.com/';
const STOCK_API_KEY = process.env.STOCK_API_KEY 

const app = express();

const PORT = 4000;


const publishStockPrice = async (symbols: string[]) => {
    // I want date in mm/dd/yyyy format the timezone is UTC
    const today = new Date();
    const start_date = `${today.getUTCMonth() + 1}/${today.getUTCDate()-1}/${today.getUTCFullYear()}`;
    const end_date = `${today.getUTCMonth() + 1}/${today.getUTCDate()}/${today.getUTCFullYear()}`;

    console.log(start_date, end_date)
    try {
        const symbolString = symbols.join(',');
        const url = `${STOCK_API_URL}time_series?symbol=${symbolString}&interval=1min&format=JSON&start_date=${start_date}&end_date=${end_date}%&apikey=${STOCK_API_KEY}`;
        const response = await axios.get(url);
        // console.log('response', response.data);
        
        for (const symbol of symbols) { 
            // console.log(response.data[symbol].values)
            PubSubManager.addDataToCache(symbol, response.data[symbol].values);
            PubSubManager.publish(symbol, response.data[symbol].values);
           
        }
    }
    catch (error) {
        console.error(`Error fetching stock price: ${error}`);
    }
}

const stockList = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'FB', 'NVDA', 'PYPL'];
cron.schedule('*/20 * * * *', () => {
    publishStockPrice(stockList);
});


 
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
})


