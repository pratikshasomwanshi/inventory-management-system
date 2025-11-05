import Customer from "../models/customerModel.js";
import { z } from "zod";

// ✅ Zod Schema for Customer Validation
const customerSchema = z.object({
  customer_name: z.string().min(2, "Customer name is required"),
  contact_number: z
    .string()
    .min(10, "Contact number must be at least 10 digits")
    .max(15, "Contact number too long"),
  email: z.string().email("Invalid email format"),
  address: z.string().min(2, "Address is required"),
});

// ➕ CREATE Customer
export const addCustomer = async (req, res) => {
  try {
    const parsed = customerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.errors[0].message });
    }

    const newCustomer = await Customer.create(parsed.data);
    res
      .status(201)
      .json({ message: "✅ Customer added successfully!", customer: newCustomer });
  } catch (error) {
    res.status(500).json({
      error: "❌ Failed to add customer",
      details: error.message,
    });
  }
};

// 📋 READ All Customers
export const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ customer_name: 1 });
    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({
      error: "❌ Failed to fetch customers",
      details: error.message,
    });
  }
};

// ✏️ UPDATE Customer
export const updateCustomer = async (req, res) => {
  try {
    const parsed = customerSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.errors[0].message });
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      parsed.data,
      { new: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.status(200).json({
      message: "✅ Customer updated successfully!",
      customer: updatedCustomer,
    });
  } catch (error) {
    res.status(500).json({
      error: "❌ Failed to update customer",
      details: error.message,
    });
  }
};

// 🗑️ DELETE Customer
export const deleteCustomer = async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);

    if (!deletedCustomer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    res.status(200).json({ message: "🗑️ Customer deleted successfully!" });
  } catch (error) {
    res.status(500).json({
      error: "❌ Failed to delete customer",
      details: error.message,
    });
  }
};
