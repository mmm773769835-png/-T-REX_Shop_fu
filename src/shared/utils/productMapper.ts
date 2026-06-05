/**
 * Standard product shape used throughout the app.
 */
export interface MappedProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  image_url?: string;
  images: string[];
  category: string;
  currency: string;
  paymentMethod: string;
  old_price: number | null;
  originalPrice: number | null;
  discount: number;
  is_new: boolean;
  stock: number | null;
  attribute: string;
}

/**
 * Maps a raw Supabase product row into the standard app product shape.
 * Consolidates the field normalization logic that was duplicated across
 * HomeV2, SearchScreen, and various contexts.
 */
export const mapRawProduct = (item: any): MappedProduct | null => {
  if (!item || !item.name) {
    return null;
  }

  return {
    id: item.id,
    name: item.name,
    price: typeof item.price === "number" ? item.price : parseFloat(item.price) || 0,
    description: item.description || "",
    imageUrl:
      item.image_url ||
      item.imageUrl ||
      "https://via.placeholder.com/300x300/CCCCCC/FFFFFF?text=No+Image",
    image_url: item.image_url || item.imageUrl,
    images: item.images || (item.image_url ? [item.image_url] : []),
    category: item.category || "غير مصنف",
    currency: item.currency || "YER",
    paymentMethod: item.payment_method || item.paymentMethod || "cash",
    old_price: item.old_price || item.original_price || null,
    originalPrice: item.original_price || item.old_price || item.originalPrice || null,
    discount: item.discount || 0,
    is_new: item.is_new || false,
    stock: item.stock ?? item.quantity ?? null,
    attribute: item.attribute || item.status || "",
  };
};

/**
 * Maps an array of raw Supabase rows, filtering out invalid entries.
 */
export const mapRawProducts = (data: any[] | null): MappedProduct[] => {
  if (!data) return [];

  const products: MappedProduct[] = [];
  for (const item of data) {
    const mapped = mapRawProduct(item);
    if (mapped) {
      products.push(mapped);
    }
  }
  return products;
};
