import mongoose from "mongoose";
import Product from "../models/productModel.js";
import PurchaseDetails from "../models/purchaseDetailsModel.js";
import SalesDetails from "../models/salesDetailsModel.js";

/**
 * 📊 VIEW STOCK SUMMARY
 * Calculates total stock for all products:
 * Opening + Purchase Inward − Sales Outward
 */
export const getStockView = async (req, res) => {
  try {
    const products = await Product.find();

    const stockData = await Promise.all(
      products.map(async (product, index) => {
        const purchaseInwardData = await PurchaseDetails.aggregate([
          { $match: { productId: new mongoose.Types.ObjectId(product._id) } },
          { $group: { _id: null, total: { $sum: "$quantity" } } },
        ]);

        const salesOutwardData = await SalesDetails.aggregate([
          { $match: { productId: new mongoose.Types.ObjectId(product._id) } },
          { $group: { _id: null, total: { $sum: "$quantity" } } },
        ]);

        const purchaseInward = purchaseInwardData[0]?.total || 0;
        const salesOutward = salesOutwardData[0]?.total || 0;

        const closingStock =
          Number(product.qty || 0) + Number(purchaseInward) - Number(salesOutward);

        return {
          srNo: index + 1,
          product_name: product.product_name,
          openingStock: product.qty || 0,
          purchaseInward,
          salesOutward,
          closingStock,
        };
      })
    );

    res.status(200).json(stockData);
  } catch (error) {
    console.error("❌ Stock View Error:", error);
    res.status(500).json({
      message: "❌ Failed to fetch stock view",
      error: error.message,
    });
  }
};

/**
 * 📦 GET STOCK FOR A SPECIFIC PRODUCT
 * Calculates available stock for a given product ID
 */
export const getProductStock = async (req, res) => {
  try {
    const { id } = req.params;

    // Find product
    const product = await Product.findById(id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    // Aggregate total purchases (inward)
    const purchaseInwardData = await PurchaseDetails.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]);

    // Aggregate total sales (outward)
    const salesOutwardData = await SalesDetails.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]);

    const purchaseInward = purchaseInwardData[0]?.total || 0;
    const salesOutward = salesOutwardData[0]?.total || 0;

    const closingStock =
      Number(product.qty || 0) + Number(purchaseInward) - Number(salesOutward);

    res.status(200).json({
      productId: id,
      product_name: product.product_name,
      availableStock: closingStock,
    });
  } catch (error) {
    console.error("❌ getProductStock Error:", error);
    res.status(500).json({
      message: "❌ Failed to fetch product stock",
      error: error.message,
    });
  }
};
