// models/salesDetailsModel.js
import mongoose from "mongoose";

const salesDetailsSchema = new mongoose.Schema(
  {
    salesMasterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalesMaster",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    amount: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("SalesDetails", salesDetailsSchema);
