import mongoose from "mongoose";

const purchaseDetailsSchema = new mongoose.Schema(
  {
    purchaseMasterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseMaster",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true },
    rate: { type: Number, required: true },
    total: { type: Number, required: true },
    purchase_inward: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("PurchaseDetails", purchaseDetailsSchema);
