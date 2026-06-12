import { api } from './api';

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
  orders_count: number;
  total_spending: number;
}

export type CustomerInput = Omit<Customer, 'id' | 'created_at' | 'orders_count' | 'total_spending'>;

export const getCustomers = async (search?: string) => {
  const response = await api.get<Customer[]>('/customers', {
    params: { search },
  });
  return response.data;
};

export const getCustomer = async (id: number) => {
  const response = await api.get<Customer>(`/customers/${id}`);
  return response.data;
};

export const createCustomer = async (data: CustomerInput) => {
  const response = await api.post<Customer>('/customers', data);
  return response.data;
};

export const deleteCustomer = async (id: number) => {
  await api.delete(`/customers/${id}`);
};
