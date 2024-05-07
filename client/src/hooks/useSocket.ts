import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setData } from "../dataSlice";
const useSocket = (url: string) => {
    // const [socket, setSocket] = useState<WebSocket | null>(null);
    // const [message, setMessage] = useState<string | null>(null);
    const dispatch = useDispatch();
    console.log('useSocket');
    useEffect(() => {
        const ws = new WebSocket(url);
        ws.onopen = () => {
            // console.log('Connected to server');
            ws.send(JSON.stringify({ payload: 'AAPL', action: 'subscribe' }));
            ws.send(JSON.stringify({ payload: 'GOOGL', action: 'subscribe' }));
            //     // newSocket.send(JSON.stringify({ payload: 'MSFT', action: 'subscribe' }));
        }


        ws.onmessage = (event) => {
            // console.log(`Received message from server: ${event.data}`);
            // setMessage(JSON.parse(event.data));
            console.log('Received message from server');
            dispatch(setData(JSON.parse(event.data)));
        }

        ws.onclose = () => {
            console.log('Disconnected from server');
        }

        // setSocket(ws);

        return () => {
            ws.close();
        }
    }, [url]);

    // return {  message };
}

export default useSocket;