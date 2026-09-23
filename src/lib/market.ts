export type MarketPrice = {
  id: string;
  state: string;
  district: string | null;
  market: string;
  commodity: string;
  variety: string;
  grade: string | null;
  arrival_date: string;
  min_price: number | null;
  max_price: number | null;
  modal_price: number | null;
};

export type MarketTrendPoint = {
  date: string;
  modalPrice: number;
};

export type MarketPricesResponse = {
  prices: MarketPrice[];
  trend: MarketTrendPoint[];
};

export type MarketSort = "date_desc" | "price_asc" | "price_desc";
