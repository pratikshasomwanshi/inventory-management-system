import { z } from "zod";

// ✅ Product Validation
export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  category: z.string().min(2, "Category is required"),
  price: z.preprocess(
    (val) => Number(val),
    z.number().positive("Price must be greater than 0")
  ),
  quantity: z.preprocess(
    (val) => Number(val),
    z.number().int().nonnegative("Quantity cannot be negative")
  ),
});

// ✅ Supplier Validation
export const supplierSchema = z.object({
  name: z.string().min(2, "Supplier name is required"),
  contact: z.string().optional(),
  address: z.string().optional(),
});

// ✅ Stock Validation (final)
export const stockSchema = z.object({
  product_name: z.string().min(1, "Product name is required"),
  opening_qty: z.preprocess(
    (val) => Number(val),
    z.number().int().nonnegative("Opening qty must be 0 or more")
  ),
  location: z.string().min(1, "Location is required"),
});
