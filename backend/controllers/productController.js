import Product from "../models/productModel.js";
import { z } from "zod";

// ✅ Zod Schema for Product Validation
const productSchema = z.object({
  product_name: z.string().min(1, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  costprice: z.number().nonnegative("Cost price must be positive"),
  sellingprice: z.number().nonnegative("Selling price must be positive"),
  qty: z.number().nonnegative("Quantity must be positive"),
  supplierId: z.string().min(1, "Supplier ID is required"),
});

// ➕ Add Product
export const addProduct = async (req, res) => {
  try {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const product = await Product.create(parsed.data);
    res.status(201).json({ message: "✅ Product added successfully!", product });
  } catch (error) {
    res.status(500).json({ error: "Failed to add product", details: error.message });
  }
};

// 📜 Get All Products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("supplierId", "supplier_name srNo");
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// ✏️ Update Product
export const updateProduct = async (req, res) => {
  try {
    const parsed = productSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, parsed.data, {
      new: true,
    });

    if (!updated) return res.status(404).json({ error: "Product not found" });
    res.status(200).json({ message: "✅ Product updated successfully!", updated });
  } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
  }
};

// ❌ Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Product not found" });

    res.status(200).json({ message: "🗑️ Product deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};
