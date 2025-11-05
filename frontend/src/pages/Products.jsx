import React, { useEffect, useState } from "react";
import api from "../api/api";
import { z } from "zod";
import { toast, Toaster } from "react-hot-toast";

// ✅ Zod schema
const productSchema = z.object({
  product_name: z.string().min(2, "Product name is required"),
  category: z.string().min(1, "Category is required"),
  costprice: z.number().min(1, "Cost price must be greater than 0"),
  sellingprice: z.number().min(1, "Selling price must be greater than 0"),
  qty: z.number().min(1, "Quantity must be greater than 0"),
  supplierId: z.string().min(1, "Please select a supplier"),
});

export default function Products() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch all suppliers
  const fetchSuppliers = async () => {
    try {
      const res = await api.get("/suppliers");
      setSuppliers(res.data);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    }
  };

  // ✅ Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("🗑️ Product deleted successfully!");
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error("❌ Failed to delete product.");
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  return (
    <div className="p-6">
      <Toaster position="top-center" />
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">
        🛒 Product Management
      </h1>

      {/* ✅ Product Form */}
      <ProductForm
        suppliers={suppliers}
        selectedProduct={selectedProduct}
        refreshProducts={fetchProducts}
        clearSelected={() => setSelectedProduct(null)}
      />

      {/* ✅ Product List */}
      <div className="mt-10 overflow-x-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-gray-800">All Products</h2>
          <button
            onClick={fetchProducts}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded"
          >
            🔄 Refresh
          </button>
        </div>

        <table className="min-w-full bg-white border rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-medium text-gray-700">
              <th className="p-2 border">Product Name</th>
              <th className="p-2 border">Category</th>
              <th className="p-2 border">Cost Price</th>
              <th className="p-2 border">Selling Price</th>
              <th className="p-2 border">Quantity</th>
              <th className="p-2 border">Supplier</th>
              <th className="p-2 border text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">
                  Loading products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-4 text-gray-500">
                  No products available
                </td>
              </tr>
            ) : (
              products.map((prod) => (
                <tr
                  key={prod._id}
                  className="text-sm hover:bg-gray-50 transition-all"
                >
                  <td className="p-2 border">{prod.product_name}</td>
                  <td className="p-2 border">{prod.category}</td>
                  <td className="p-2 border">{prod.costprice}</td>
                  <td className="p-2 border">{prod.sellingprice}</td>
                  <td className="p-2 border">{prod.qty}</td>
                  <td className="p-2 border">
                    {prod.supplierId?.supplier_name || prod.supplierId}
                  </td>
                  <td className="p-2 border text-center space-x-2">
                    <button
                      onClick={() => setSelectedProduct(prod)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(prod._id)}
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

// ✅ Product Form Component
function ProductForm({ suppliers, selectedProduct, refreshProducts, clearSelected }) {
  const [formData, setFormData] = useState({
    product_name: "",
    category: "",
    costprice: "",
    sellingprice: "",
    qty: "",
    supplierId: "",
  });
  const [errors, setErrors] = useState({});

  const categoryOptions = [
    "Electronics",
    "Furniture",
    "Groceries",
    "Clothing",
    "Stationery",
  ];

  useEffect(() => {
    if (selectedProduct) {
      setFormData({
        product_name: selectedProduct.product_name,
        category: selectedProduct.category,
        costprice: selectedProduct.costprice,
        sellingprice: selectedProduct.sellingprice,
        qty: selectedProduct.qty,
        supplierId:
          selectedProduct.supplierId?._id || selectedProduct.supplierId || "",
      });
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedProduct]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.type === "number" ? Number(e.target.value) : e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = productSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      if (selectedProduct) {
        await api.put(`/products/${selectedProduct._id}`, formData);
        toast.success("✅ Product updated successfully!");
      } else {
        await api.post("/products", formData);
        toast.success("✅ Product added successfully!");
      }

      setFormData({
        product_name: "",
        category: "",
        costprice: "",
        sellingprice: "",
        qty: "",
        supplierId: "",
      });
      setErrors({});
      clearSelected();
      refreshProducts();
    } catch (err) {
      console.error("Error saving product:", err);
      toast.error("❌ Failed to save product.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-5 rounded-lg shadow-lg grid grid-cols-2 gap-4"
    >
      {/* Product Name */}
      <div>
        <input
          type="text"
          name="product_name"
          placeholder="Product Name"
          value={formData.product_name}
          onChange={handleChange}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
        />
        {errors.product_name && (
          <p className="text-red-500 text-sm mt-1">{errors.product_name}</p>
        )}
      </div>

      {/* Category Dropdown */}
      <div>
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select Category</option>
          {categoryOptions.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-500 text-sm mt-1">{errors.category}</p>
        )}
      </div>

      {/* Cost Price */}
      <div>
        <input
          type="number"
          name="costprice"
          placeholder="Cost Price"
          value={formData.costprice}
          onChange={handleChange}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
        />
        {errors.costprice && (
          <p className="text-red-500 text-sm mt-1">{errors.costprice}</p>
        )}
      </div>

      {/* Selling Price */}
      <div>
        <input
          type="number"
          name="sellingprice"
          placeholder="Selling Price"
          value={formData.sellingprice}
          onChange={handleChange}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
        />
        {errors.sellingprice && (
          <p className="text-red-500 text-sm mt-1">{errors.sellingprice}</p>
        )}
      </div>

      {/* Quantity */}
      <div>
        <input
          type="number"
          name="qty"
          placeholder="Quantity"
          value={formData.qty}
          onChange={handleChange}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
        />
        {errors.qty && (
          <p className="text-red-500 text-sm mt-1">{errors.qty}</p>
        )}
      </div>

      {/* Supplier Dropdown */}
      <div>
        <select
          name="supplierId"
          value={formData.supplierId}
          onChange={handleChange}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Select Supplier</option>
          {suppliers.map((sup) => (
            <option key={sup._id} value={sup._id}>
              {sup.supplier_name}
            </option>
          ))}
        </select>
        {errors.supplierId && (
          <p className="text-red-500 text-sm mt-1">{errors.supplierId}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-all"
      >
        {selectedProduct ? "💾 Update Product" : "➕ Add Product"}
      </button>
    </form>
  );
}
