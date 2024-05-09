import { createSlice } from '@reduxjs/toolkit';
import { StockData } from './types/StockData';
import { StockItemData } from './types/StockItemData';

const initialState: StockData = {
    data: []
};


const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        setData(state, action) {
            console.log(action.payload);
            Object.keys(action.payload).forEach((key: string) => {
               
                // console.log(key)
                const values: StockItemData[] = []
                Object.keys(action.payload[key]).forEach((innerKey: string) => {
                    // console.log(innerKey)
                    action.payload[key][innerKey].forEach((value: StockItemData) => {
                        // console.log(value)
                        values.push(value)
                    }
                    )


                });
                state.data = ( {...state.data, [key]: { values: values } })
            });

            // console.log(state.data);
            console.log('setData');
        }

    }
});


export const { setData } = dataSlice.actions;
export default dataSlice.reducer;