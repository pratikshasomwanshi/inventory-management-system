// models/salesMasterModel.js
import mongoose from "mongoose";
import { z } from "zod";

// ✅ Zod validation schema
export const salesMasterValidation = z.object({
  customerId: z.string({ required_error: "Customer ID is required" }),
  totalAmount: z.number().min(0, "Total amount is required"),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number(),
      price: z.number(),
      amount: z.number(),
    })
  ),
});

const salesMasterSchema = new mongoose.Schema({
  invoiceNo: {
    type: String,
    default: () => `INV-${Date.now()}`,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true,
  },
  totalAmount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

export default mongoose.model("SalesMaster", salesMasterSchema);
