import React, { useState, useEffect } from "react";
import api from "../api/api";
import { z } from "zod";
import { toast, Toaster } from "react-hot-toast";

// ✅ Zod validation schema
const supplierSchema = z.object({
  supplier_name: z.string().min(1, "Supplier name is required"),
  contact_number: z
    .string()
    .min(10, "Contact number must be at least 10 digits"),
  email: z.string().email("Invalid email format"),
  address: z.string().min(1, "Address is required"),
});

export default function Supplier() {
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    supplier_name: "",
    contact_number: "",
    email: "",
    address: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // ✅ Fetch all suppliers
  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/suppliers");
      setSuppliers(res.data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      toast.error("❌ Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // ✅ Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ Handle Submit (Add / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = supplierSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      if (editingId) {
        await api.put(`/suppliers/${editingId}`, formData);
        toast.success("✅ Supplier updated successfully!");
      } else {
        await api.post("/suppliers", formData);
        toast.success("✅ Supplier added successfully!");
      }

      setFormData({
        supplier_name: "",
        contact_number: "",
        email: "",
        address: "",
      });
      setErrors({});
      setEditingId(null);
      fetchSuppliers();
    } catch (error) {
      console.error("Error saving supplier:", error);
      toast.error("❌ Failed to save supplier.");
    }
  };

  // ✅ Edit supplier
  const handleEdit = (supplier) => {
    setFormData({
      supplier_name: supplier.supplier_name,
      contact_number: supplier.contact_number,
      email: supplier.email,
      address: supplier.address,
    });
    setEditingId(supplier._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Delete supplier
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await api.delete(`/suppliers/${id}`);
      toast.success("🗑️ Supplier deleted successfully!");
      fetchSuppliers();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error("❌ Failed to delete supplier.");
    }
  };

  return (
    <div className="p-6">
      <Toaster position="top-center" />
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">
        🧾 Supplier Management
      </h1>

      {/* ✅ Supplier Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-5 rounded-lg shadow-lg grid grid-cols-2 gap-4"
      >
        <div>
          <input
            type="text"
            name="supplier_name"
            placeholder="Supplier Name"
            value={formData.supplier_name}
            onChange={handleChange}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
          />
          {errors.supplier_name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.supplier_name}
            </p>
          )}
        </div>

        <div>
          <input
            type="text"
            name="contact_number"
            placeholder="Contact Number"
            value={formData.contact_number}
            onChange={handleChange}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
          />
          {errors.contact_number && (
            <p className="text-red-500 text-sm mt-1">
              {errors.contact_number}
            </p>
          )}
        </div>

        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={formData.address}
            onChange={handleChange}
            className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
          )}
        </div>

        <button
          type="submit"
          className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-all"
        >
          {editingId ? "💾 Update Supplier" : "➕ Add Supplier"}
        </button>
      </form>

      {/* ✅ Supplier Table */}
      <div className="mt-10 overflow-x-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            All Suppliers
          </h2>
          <button
            onClick={fetchSuppliers}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded"
          >
            🔄 Refresh
          </button>
        </div>

        <table className="min-w-full bg-white border rounded-lg shadow-md">
          <thead>
               <tr className="bg-gray-100 text-left text-sm font-medium text-gray-800">
              <th className="p-2 border">Sr No.</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Contact</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Address</th>
              <th className="p-2 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center p-4 text-gray-500"
                >
                  Loading suppliers...
                </td>
              </tr>
            ) : suppliers.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center p-4 text-gray-500"
                >
                  No suppliers available
                </td>
              </tr>
            ) : (
              suppliers.map((supplier, index) => (
                <tr
                  key={supplier._id}
                  className="text-sm hover:bg-gray-50 transition-all"
                >
                  <td className="p-2 border">{index + 1}</td>
                  <td className="p-2 border">{supplier.supplier_name}</td>
                  <td className="p-2 border">{supplier.contact_number}</td>
                  <td className="p-2 border">{supplier.email}</td>
                  <td className="p-2 border">{supplier.address}</td>
                  <td className="p-2 border text-center space-x-2">
                    <button
                      onClick={() => handleEdit(supplier)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(supplier._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
