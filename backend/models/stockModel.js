import mongoose from "mongoose";

const stockSchema = new mongoose.Schema(
  {
    // 🔗 productId is a String (since your Product uses productId: "PROD-...")
    productId: { type: String, required: true, ref: "Product" },

    openingStock: { type: Number, default: 0 },
    inward: { type: Number, default: 0 },
    outward: { type: Number, default: 0 },
    closingStock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// 🔢 Auto calculate closing stock
stockSchema.pre("save", function (next) {
  this.closingStock = this.openingStock + this.inward - this.outward;
  next();
});

export default mongoose.model("Stock", stockSchema);
