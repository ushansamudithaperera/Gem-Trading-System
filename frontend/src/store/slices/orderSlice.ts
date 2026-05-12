import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Order {
  _id: string;
  orderNumber: string;
  amount: number;
  status: string;
  escrowStatus: string;
  createdAt: string;
  gemId: { title: string; images: string[] };
}

interface OrderState {
  orders: Order[];
  selectedOrder: any | null;
  loading: boolean;
}

const initialState: OrderState = {
  orders: [],
  selectedOrder: null,
  loading: false,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    setSelectedOrder: (state, action: PayloadAction<any>) => {
      state.selectedOrder = action.payload;
    },
    setOrderLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: string }>) => {
      const index = state.orders.findIndex(o => o._id === action.payload.orderId);
      if (index !== -1) {
        state.orders[index].status = action.payload.status;
      }
      if (state.selectedOrder?._id === action.payload.orderId) {
        state.selectedOrder.status = action.payload.status;
      }
    },
  },
});

export const { setOrders, setSelectedOrder, setOrderLoading, addOrder, updateOrderStatus } = orderSlice.actions;
export default orderSlice.reducer;