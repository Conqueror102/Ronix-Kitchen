// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from 'redux';
import { apiSlice } from '../features/RTKQUERY';
import authReducer from '../features/authSlice';
import adminReducer from '../features/adminSlice';
import productSlice from "../features/productSlice.jsx"
import cartReducer from '../features/cartSlice';
import {
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth', 'admin'], // Persist both auth and admin state
};

const rootReducer = combineReducers({
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    admin: adminReducer,
    product: productSlice,
    cart: cartReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(apiSlice.middleware),
});

setupListeners(store.dispatch);

export const persistor = persistStore(store);
export default store;
