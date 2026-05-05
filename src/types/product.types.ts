// ==========================================
// PRODUCT TYPES
// ==========================================

export type ProductType = "PHYSICAL" | "DIGITAL" | "BOTH";

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  product_type: ProductType;
  stock: number | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
}
