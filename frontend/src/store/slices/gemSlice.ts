import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Gem } from '../../services/gem.service';

interface GemState {
  marketplaceGems: Gem[];
  selectedGem: Gem | null;
  sellerGems: Gem[];
  loading: boolean;
  total: number;
  filters: {
    type: string;
    minPrice: number | '';
    maxPrice: number | '';
    minWeight: number | '';
    maxWeight: number | '';
    location: string;
  };
}

const initialState: GemState = {
  marketplaceGems: [],
  selectedGem: null,
  sellerGems: [],
  loading: false,
  total: 0,
  filters: {
    type: '',
    minPrice: '',
    maxPrice: '',
    minWeight: '',
    maxWeight: '',
    location: '',
  },
};

const gemSlice = createSlice({
  name: 'gems',
  initialState,
  reducers: {
    setMarketplaceGems: (state, action: PayloadAction<{ gems: Gem[]; total: number }>) => {
      state.marketplaceGems = action.payload.gems;
      state.total = action.payload.total;
    },
    setSelectedGem: (state, action: PayloadAction<Gem | null>) => {
      state.selectedGem = action.payload;
    },
    setSellerGems: (state, action: PayloadAction<Gem[]>) => {
      state.sellerGems = action.payload;
    },
    setGemLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    updateFilters: (state, action: PayloadAction<Partial<GemState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const {
  setMarketplaceGems,
  setSelectedGem,
  setSellerGems,
  setGemLoading,
  updateFilters,
  resetFilters,
} = gemSlice.actions;
export default gemSlice.reducer;