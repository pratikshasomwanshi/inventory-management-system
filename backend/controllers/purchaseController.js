import PurchaseMaster from "../models/purchaseMasterModel.js";
import PurchaseDetails from "../models/purchaseDetailsModel.js";
import Product from "../models/ProductModel.js";
import { z } from "zod";

// ✅ Validation
const purchaseSchema = z.object({
  supplierId: z.string().min(1, "Supplier is required"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, "Product required"),
        quantity: z.number().positive("Qty > 0"),
        rate: z.number().positive("Rate > 0"),
      })
    )
    .min(1, "At least one product required"),
});

// ➕ CREATE PURCHASE
export const createPurchase = async (req, res) => {
  try {
    const data = purchaseSchema.parse(req.body);
    const { supplierId, items } = data;

    const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.rate, 0);

    const purchaseMaster = await PurchaseMaster.create({
      supplierId,
      totalAmount,
    });

    await Promise.all(
      items.map(async (i) => {
        await PurchaseDetails.create({
          purchaseMasterId: purchaseMaster._id,
          productId: i.productId,
          quantity: i.quantity,
          rate: i.rate,
          total: i.quantity * i.rate,
          purchase_inward: i.quantity,
        });

        // 🧮 Update product stock
        await Product.findByIdAndUpdate(i.productId, {
          $inc: { stock: i.quantity },
        });
      })
    );

    res.status(201).json({ message: "✅ Purchase added successfully!" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "❌ Failed to add purchase", error: err.message });
  }
};

// 📋 READ ALL
export const getPurchases = async (req, res) => {
  try {
    const masters = await PurchaseMaster.find()
      .populate("supplierId", "supplier_name")
      .lean();

    for (const m of masters) {
      const details = await PurchaseDetails.find({
        purchaseMasterId: m._id,
      }).populate("productId", "product_name");
      m.details = details;
    }

    res.json(masters);
  } catch (err) {
    res.status(500).json({ message: "❌ Error fetching purchases" });
  }
};

// ✏️ UPDATE
export const updatePurchase = async (req, res) => {
  try {
    const data = purchaseSchema.parse(req.body);
    const { supplierId, items } = data;
    const id = req.params.id;

    const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.rate, 0);

    const updatedMaster = await PurchaseMaster.findByIdAndUpdate(
      id,
      { supplierId, totalAmount },
      { new: true }
    );

    if (!updatedMaster)
      return res.status(404).json({ message: "Purchase not found" });

    // Remove old details and recreate
    await PurchaseDetails.deleteMany({ purchaseMasterId: id });
    await Promise.all(
      items.map((i) =>
        PurchaseDetails.create({
          purchaseMasterId: id,
          productId: i.productId,
          quantity: i.quantity,
          rate: i.rate,
          total: i.quantity * i.rate,
          purchase_inward: i.quantity,
        })
      )
    );

    res.json({ message: "✅ Purchase updated successfully" });
  } catch (err) {
    res
      .status(400)
      .json({ message: "❌ Failed to update purchase", error: err.message });
  }
};

// 🗑️ DELETE
export const deletePurchase = async (req, res) => {
  try {
    const id = req.params.id;
    await PurchaseMaster.findByIdAndDelete(id);
    await PurchaseDetails.deleteMany({ purchaseMasterId: id });
    res.json({ message: "🗑️ Purchase deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "❌ Error deleting purchase" });
  }
};
