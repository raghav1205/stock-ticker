import { createSlice } from '@reduxjs/toolkit';
import { StockData } from './types/StockData';

const initialState: StockData = {
    data: []
};


const dataSlice = createSlice({
    name: 'data',
    initialState,
    reducers: {
        setData(state, action) {
            state.data = action.payload;
            console.log(state.data)
            console.log('setData');
        }
    }
});


export const { setData } = dataSlice.actions;
export default dataSlice.reducer;