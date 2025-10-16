"use client";
import { configureStore } from "@reduxjs/toolkit";
import sessionReducer from "./sessionSlice";
import { productsApi } from "./productsApi";

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    [productsApi.reducerPath]: productsApi.reducer,
  },
  middleware: (gDM) => gDM().concat(productsApi.middleware),
});

export const getState = store.getState;
export const dispatch = store.dispatch;
