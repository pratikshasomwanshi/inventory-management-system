import Supplier from "../models/supplierModel.js";
import { z } from "zod";

// ✅ Zod Schema (match frontend field names)
const supplierSchema = z.object({
  supplier_name: z.string().min(1, "Supplier name is required"),
  contact_number: z.string().min(10, "Contact number must be at least 10 digits"),
  email: z.string().email("Invalid email format"),
  address: z.string().min(1, "Address is required"),
});

// 🔢 Generate Auto SR No
const generateSrNo = async () => {
  const count = await Supplier.countDocuments();
  return count + 1;
};

// ➕ Add Supplier
export const addSupplier = async (req, res) => {
  try {
    const parsed = supplierSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const sr_no = await generateSrNo();
    const supplier = await Supplier.create({ ...parsed.data, sr_no });

    res.status(201).json({ message: "✅ Supplier added successfully!", supplier });
  } catch (error) {
    console.error("❌ Error in addSupplier:", error);
    res.status(500).json({ error: "Failed to add supplier", details: error.message });
  }
};

// 📜 Get All Suppliers
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ sr_no: 1 });
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch suppliers" });
  }
};

// ✏️ Update Supplier
export const updateSupplier = async (req, res) => {
  try {
    const parsed = supplierSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const updated = await Supplier.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
    if (!updated) return res.status(404).json({ error: "Supplier not found" });

    res.status(200).json({ message: "✅ Supplier updated successfully!", updated });
  } catch (error) {
    console.error("❌ Error in updateSupplier:", error);
    res.status(500).json({ error: "Failed to update supplier" });
  }
};

// ❌ Delete Supplier
export const deleteSupplier = async (req, res) => {
  try {
    const deleted = await Supplier.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Supplier not found" });

    res.status(200).json({ message: "🗑️ Supplier deleted successfully!" });
  } catch (error) {
    console.error("❌ Error in deleteSupplier:", error);
    res.status(500).json({ error: "Failed to delete supplier" });
  }
};
