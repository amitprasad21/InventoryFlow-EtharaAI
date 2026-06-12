import { api } from './api';
import type { Order } from './orders';

export interface LowStockWidget {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  category?: string;
  status: 'out_of_stock' | 'low_stock';
}

export interface RevenueDataPoint {
  name: string;
  revenue: number;
  orders: number;
}

export interface DashboardStats {
  total_products: number;
  total_customers: number;
  total_orders: number;
  total_revenue: number;
  revenue_growth: number;
  orders_growth: number;
  products_growth: number;
  customers_growth: number;
  low_stock_alerts: LowStockWidget[];
  recent_orders: Order[];
  revenue_chart: RevenueDataPoint[];
}

export const getDashboardStats = async () => {
  const response = await api.get<DashboardStats>('/analytics/dashboard');
  return response.data;
};
