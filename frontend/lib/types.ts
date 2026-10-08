export type Product = {
  id: number;
  name: string;
  description: string;
  price: string;
  stock: number;
  image_url: string | null;
  category: string;
  colors: string[];
  sizes: string[];
};

export type CartItem = {
  product_id: number;
  name: string;
  price: number;
  color: string;
  size: string;
  quantity: number;
  image?: string | null;
};
