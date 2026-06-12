import { api } from './api';

export interface OrderItemInput {
  product_id: number;
  quantity: number;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  product_name?: string;
  product_sku?: string;
}

export interface Order {
  id: number;
  customer_id: number;
  customer_name?: string;
  customer_email?: string;
  total_amount: number;
  status: string; // 'Pending' | 'Processing' | 'Delivered' | 'Cancelled'
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface OrderInput {
  customer_id: number;
  items: OrderItemInput[];
}

export const getOrders = async (status?: string) => {
  const response = await api.get<Order[]>('/orders', {
    params: { status },
  });
  return response.data;
};

export const getOrder = async (id: number) => {
  const response = await api.get<Order>(`/orders/${id}`);
  return response.data;
};

export const createOrder = async (data: OrderInput) => {
  const response = await api.post<Order>('/orders', data);
  return response.data;
};

export const cancelOrder = async (id: number) => {
  const response = await api.delete<Order>(`/orders/${id}`);
  return response.data;
};
