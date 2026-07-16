import { configureStore } from "@reduxjs/toolkit";
import codeReducer from "./codeSlice";
import historyReducer from "./historySlice";

export const store = configureStore({
  reducer: {
    code: codeReducer,
    history: historyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;