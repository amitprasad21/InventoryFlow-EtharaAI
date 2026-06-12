import axios from 'axios';
import { api } from './api';

export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  category?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export type ProductInput = Omit<Product, 'id' | 'created_at' | 'updated_at'>;

export const getProducts = async (search?: string, category?: string) => {
  const response = await api.get<Product[]>('/products', {
    params: { search, category },
  });
  return response.data;
};

export const getProduct = async (id: number) => {
  const response = await api.get<Product>(`/products/${id}`);
  return response.data;
};

export const createProduct = async (data: ProductInput) => {
  const response = await api.post<Product>('/products', data);
  return response.data;
};

export const updateProduct = async (id: number, data: Partial<ProductInput>) => {
  const response = await api.put<Product>(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: number) => {
  await api.delete(`/products/${id}`);
};

export const uploadProductImage = async (file: File) => {
  try {
    // 1. Try unsigned direct upload first (ideal for default unsigned presets like ml_default)
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default');

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/dk1iafhnd/image/upload`;
    const uploadResponse = await axios.post<{ secure_url: string }>(cloudinaryUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return { image_url: uploadResponse.data.secure_url };
  } catch (err) {
    console.warn("Unsigned upload failed or preset requires signature, attempting signed upload fallback...", err);

    // 2. Fallback to Option A: Signed direct upload using signature from backend settings
    const { data: sigData } = await api.get<{
      signature: string;
      timestamp: number;
      api_key: string;
      cloud_name: string;
      upload_preset: string;
    }>('/upload/signature');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', sigData.api_key);
    formData.append('timestamp', sigData.timestamp.toString());
    formData.append('signature', sigData.signature);
    formData.append('upload_preset', sigData.upload_preset);

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${sigData.cloud_name}/image/upload`;
    const uploadResponse = await axios.post<{ secure_url: string }>(cloudinaryUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return { image_url: uploadResponse.data.secure_url };
  }
};
