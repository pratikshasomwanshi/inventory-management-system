import mongoose from "mongoose";
import { z } from "zod";

export const productValidation = z.object({
  product_name: z.string().min(2, "Product name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  costprice: z.number().nonnegative(),
  sellingprice: z.number().nonnegative(),
  qty: z.number().int().nonnegative(),
  supplierId: z.string().optional(),
});

const productSchema = new mongoose.Schema({
  productId: { type: String, default: () => `PROD-${Date.now()}` },
  product_name: { type: String, required: true },
  description: String,
  category: String,
  costprice: Number,
  sellingprice: Number,
  qty: Number,
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.Product || mongoose.model("Product", productSchema);

