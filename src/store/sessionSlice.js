"use client";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token:
    typeof window !== "undefined"
      ? localStorage.getItem("bitechx_token")
      : null,
  email:
    typeof window !== "undefined"
      ? localStorage.getItem("bitechx_email")
      : null,
};

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    setSession(state, action) {
      const { token, email } = action.payload || {};
      state.token = token || null;
      state.email = email || null;
      if (typeof window !== "undefined") {
        if (token) localStorage.setItem("bitechx_token", token);
        if (email) localStorage.setItem("bitechx_email", email);
        window.dispatchEvent(new Event("bitechx-auth"));
      }
    },
    clearSession(state) {
      state.token = null;
      state.email = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("bitechx_token");
        localStorage.removeItem("bitechx_email");
        window.dispatchEvent(new Event("bitechx-auth"));
      }
    },
  },
});

export const { setSession, clearSession } = sessionSlice.actions;

export const selectToken = (state) => state.session.token;
export const selectEmail = (state) => state.session.email;

export default sessionSlice.reducer;
