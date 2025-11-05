import React, { useEffect, useState } from "react";
import axios from "../api/api";
import { z } from "zod";
import { toast, Toaster } from "react-hot-toast";

const itemSchema = z.object({
  productId: z.string().min(1, "Product required"),
  quantity: z.number().positive("Qty > 0"),
  rate: z.number().positive("Rate > 0"),
});

export default function Purchase() {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState([]);
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  ); // ✅ Default today
  const [editId, setEditId] = useState(null);

  // ✅ Fetch all data
  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
    fetchPurchases();
  }, []);

  const fetchSuppliers = async () => {
    const res = await axios.get("/suppliers");
    setSuppliers(res.data);
  };

  const fetchProducts = async () => {
    const res = await axios.get("/products");
    setProducts(res.data);
  };

  const fetchPurchases = async () => {
    const res = await axios.get("/purchases");
    setPurchases(res.data);
  };

  // ➕ Add new item row
  const addItem = () =>
    setItems([...items, { productId: "", quantity: 0, rate: 0 }]);

  // 🧾 Handle item changes
  const handleItemChange = (i, field, value) => {
    const newItems = [...items];
    newItems[i][field] =
      field === "quantity" || field === "rate" ? Number(value) : value;
    setItems(newItems);
  };

  // 💰 Calculate total
  const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.rate, 0);

  // 💾 Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      items.forEach((i) => itemSchema.parse(i));
      const payload = { supplierId, items, date: purchaseDate };

      if (editId) {
        await axios.put(`/purchases/${editId}`, payload);
        toast.success("✅ Purchase updated successfully!");
      } else {
        await axios.post("/purchases", payload);
        toast.success("✅ Purchase added successfully!");
      }

      setSupplierId("");
      setItems([]);
      setEditId(null);
      setPurchaseDate(new Date().toISOString().split("T")[0]); // reset date to today
      fetchPurchases();
    } catch (err) {
      toast.error("❌ " + err.message);
    }
  };

  // ✏️ Edit
  const handleEdit = (p) => {
    setSupplierId(p.supplierId?._id || "");
    setItems(
      p.details?.map((d) => ({
        productId: d.productId?._id || "",
        quantity: d.quantity,
        rate: d.rate,
      })) || []
    );
    setPurchaseDate(p.date?.split("T")[0] || new Date().toISOString().split("T")[0]);
    setEditId(p._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🗑️ Delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this purchase?")) {
      await axios.delete(`/purchases/${id}`);
      fetchPurchases();
      toast.success("🗑️ Purchase deleted!");
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-2xl shadow-lg mt-6">
      <Toaster position="top-center" reverseOrder={false} />

      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
        🧾 Purchase Management
      </h2>

      {/* 🧩 Purchase Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-5 rounded-xl shadow-inner space-y-4"
      >
        {/* 📅 Date Field */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Purchase Date
          </label>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="border p-2 w-full rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            required
          />
        </div>

        {/* 🧾 Supplier */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            Supplier
          </label>
          <select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="border p-2 w-full rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
            required
          >
            <option value="">Select Supplier</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.supplier_name}
              </option>
            ))}
          </select>
        </div>

        {/* 🧩 Item Rows */}
        {items.map((it, i) => (
          <div
            key={i}
            className="grid grid-cols-5 gap-3 items-center border-b pb-2"
          >
            <select
              value={it.productId}
              onChange={(e) => handleItemChange(i, "productId", e.target.value)}
              className="border p-2 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
              required
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.product_name}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={it.quantity}
              onChange={(e) => handleItemChange(i, "quantity", e.target.value)}
              className="border p-2 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
              placeholder="Qty"
            />

            <input
              type="number"
              value={it.rate}
              onChange={(e) => handleItemChange(i, "rate", e.target.value)}
              className="border p-2 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
              placeholder="Rate"
            />

            <input
              type="number"
              readOnly
              value={it.quantity * it.rate}
              className="border p-2 rounded-lg bg-gray-100 text-gray-600"
            />

            <button
              type="button"
              onClick={() => setItems(items.filter((_, idx) => idx !== i))}
              className="text-red-600 font-bold hover:scale-110 transition-transform"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="bg-green-400 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow-md transition-transform hover:scale-105"
        >
          ➕ Add Item
        </button>

        <div className="text-right text-gray-800 font-semibold text-lg">
          Total: ₹{totalAmount}
        </div>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded"
        >
          {editId ? "Update Purchase" : "Save Purchase"}
        </button>
      </form>

      {/* 📊 All Purchases */}
      <div className="mt-10">
        <h3 className="text-xl font-bold mb-3 text-indigo-700 flex items-center gap-2">
          📋 All Purchases
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-xl overflow-hidden shadow-md">
            <thead className="bg-gray-100 text-left text-sm font-medium text-gray-700">
              <tr>
                <th className="p-3 text-left">Supplier</th>
                <th className="p-3 text-left">Products</th>
                <th className="p-3 text-center">Total (₹)</th>
                <th className="p-3 text-center">Date</th> {/* ✅ Added Date Column */}
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr
                  key={p._id}
                  className="bg-white even:bg-gray-50 border-b hover:bg-indigo-50 transition"
                >
                  <td className="p-3">{p.supplierId?.supplier_name}</td>
                  <td className="p-3">
                    {p.details.map((d) => d.productId?.product_name).join(", ")}
                  </td>
                  <td className="p-3 text-center font-semibold">
                    ₹{p.totalAmount}
                  </td>
                  <td className="p-3 text-center">
                    {new Date(p.date).toLocaleDateString("en-IN")}
                  </td>
                  <td className="p-3 flex justify-center gap-2">
                    <button
                      onClick={() => handleEdit(p)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded-md shadow-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md shadow-sm"
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
