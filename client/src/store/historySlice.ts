import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchHistory, deleteHistoryItem, clearHistory } from "../api/historyApi";
import { HistoryItem } from "../types";

interface HistoryState {
  items: HistoryItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: HistoryState = {
  items: [],
  isLoading: false,
  error: null,
};

export const loadHistory = createAsyncThunk("history/load", async () => {
  return await fetchHistory();
});

export const removeHistoryItem = createAsyncThunk("history/remove", async (id: string) => {
  await deleteHistoryItem(id);
  return id;
});

export const clearAllHistory = createAsyncThunk("history/clearAll", async () => {
  await clearHistory();
});

const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(loadHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? "Could not load history.";
      })
      .addCase(removeHistoryItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(clearAllHistory.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export default historySlice.reducer;