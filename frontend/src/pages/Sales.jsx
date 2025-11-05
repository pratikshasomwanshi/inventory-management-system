import React, { useEffect, useState } from "react";
import axios from "../api/api";
import { z } from "zod";
import { toast, Toaster } from "react-hot-toast";
import SalesBillPrint from "./SalesBillPrint";

// 🧾 Validation Schema
const itemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  price: z.number().positive("Price must be greater than 0"),
});

export default function Sales() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [date, setDate] = useState("");
  const [items, setItems] = useState([]);
  const [editId, setEditId] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);

  // 🔹 Generate automatic invoice number
  const generateInvoiceNo = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setInvoiceNo(`INV-${Date.now()}-${randomNum}`);
  };

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
    fetchSales();
    generateInvoiceNo();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get("/customers");
      setCustomers(res.data);
    } catch {
      toast.error("❌ Failed to fetch customers");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/products");
      const allProducts = res.data;

      // ✅ Add stock info
      const updatedProducts = await Promise.all(
        allProducts.map(async (p) => {
          try {
            const stockRes = await axios.get(`/stocks/product/${p._id}`);
            return { ...p, stock: stockRes.data.availableStock ?? 0 };
          } catch {
            return { ...p, stock: 0 };
          }
        })
      );

      setProducts(updatedProducts);
    } catch {
      toast.error("❌ Failed to fetch products");
    }
  };

  const fetchSales = async () => {
    try {
      const res = await axios.get("/sales");
      setSales(res.data);
    } catch {
      toast.error("❌ Failed to fetch sales");
    }
  };

  // ➕ Add new item
  const addItem = () =>
    setItems([...items, { productId: "", quantity: 0, price: 0, stock: 0 }]);

  // 🧮 Handle field change
  const handleItemChange = async (i, field, value) => {
    const newItems = [...items];
    newItems[i][field] =
      field === "quantity" || field === "price" ? Number(value) : value;

    // ✅ When product selected, auto-load stock
    if (field === "productId" && value) {
      const selectedProduct = products.find((p) => p._id === value);
      const availableStock = selectedProduct?.stock ?? 0;
      newItems[i].stock = availableStock;
      toast.success(`📦 ${availableStock} units available`);
    }

    // ✅ Validate quantity vs stock
    if (field === "quantity" && newItems[i].stock !== undefined) {
      const available = newItems[i].stock;
      const qty = Number(value);
      if (qty > available) {
        const diff = qty - available;
        toast.error(
          `⚠️ Only ${available} units available. Remaining ${diff} units not in stock!`
        );
      }
    }

    setItems(newItems);
  };

  // 💰 Calculate total
  const totalAmount = items.reduce((sum, i) => sum + i.quantity * i.price, 0);

  // 💾 Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent saving if stock invalid
    if (items.some((i) => i.quantity > (i.stock ?? 0))) {
      toast.error("❌ Some products exceed available stock!");
      return;
    }

    try {
      if (!customerId || items.length === 0)
        throw new Error("Please fill all fields");

      items.forEach((i) => itemSchema.parse(i));

      const payload = {
        customerId,
        invoiceNo,
        date: new Date(date),
        totalAmount,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
          amount: i.quantity * i.price,
        })),
      };

      if (editId) {
        await axios.put(`/sales/${editId}`, payload);
        toast.success("✅ Sale updated successfully!");
      } else {
        await axios.post("/sales", payload);
        toast.success("✅ Sale added successfully!");
      }

      setCustomerId("");
      setDate("");
      setItems([]);
      setEditId(null);
      generateInvoiceNo();
      fetchSales();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to save sale. Check all fields!");
    }
  };

  const handleEdit = (s) => {
    setCustomerId(s.customerId?._id || "");
    setInvoiceNo(s.invoiceNo);
    setDate(s.date.split("T")[0]);
    setItems(
      s.details?.map((d) => ({
        productId: d.productId?._id || "",
        quantity: d.quantity,
        price: d.price,
        stock: 0,
      })) || []
    );
    setEditId(s._id);
    toast("✏️ Edit mode activated", { icon: "🟡" });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this sale?")) {
      await axios.delete(`/sales/${id}`);
      fetchSales();
      toast.success("🗑️ Sale deleted successfully!");
    }
  };

  const handlePrint = (s) => {
    setSelectedSale(s);
  };

  // 🎨 Helper: Color-coded stock label
  const getStockLabel = (stock) => {
    if (stock <= 0)
      return <span className="text-red-600 font-semibold">🔴 Out of Stock</span>;
    if (stock <= 10)
      return <span className="text-yellow-600 font-semibold">🟠 Low ({stock})</span>;
    return <span className="text-green-600 font-semibold">🟢 Stock: {stock}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-6">
      <Toaster position="top-center" />

      <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">
        🧾 Sales Management
      </h2>

      {/* 🧩 Sales Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Customer */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Select Customer
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="border p-2 w-full rounded focus:ring focus:ring-blue-300"
              required
            >
              <option value="">-- Select Customer --</option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.customer_name}
                </option>
              ))}
            </select>
          </div>

          {/* Invoice */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Invoice Number
            </label>
            <input
              type="text"
              value={invoiceNo}
              readOnly
              className="border p-2 rounded w-full bg-gray-100 text-gray-600"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Sale Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border p-2 rounded w-full focus:ring focus:ring-blue-300"
              required
            />
          </div>
        </div>

        {/* 🛒 Sale Items */}
        <div className="mt-4">
          <h3 className="font-semibold mb-2 text-lg text-gray-800">
            🛒 Sale Items
          </h3>

          {items.map((it, i) => (
            <div
              key={i}
              className="grid grid-cols-5 gap-2 items-center border-b py-2"
            >
              <select
                value={it.productId}
                onChange={(e) =>
                  handleItemChange(i, "productId", e.target.value)
                }
                className="border p-2 rounded focus:ring focus:ring-indigo-300"
                required
              >
                <option value="">Select Product</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.product_name} — Stock: {p.stock}
                  </option>
                ))}
              </select>

              <input
                type="number"
                value={it.quantity}
                onChange={(e) =>
                  handleItemChange(i, "quantity", e.target.value)
                }
                className="border p-2 rounded"
                placeholder="Quantity"
              />

              <input
                type="number"
                value={it.price}
                onChange={(e) =>
                  handleItemChange(i, "price", e.target.value)
                }
                className="border p-2 rounded"
                placeholder="Price"
              />

              <input
                type="number"
                readOnly
                value={it.quantity * it.price}
                className="border p-2 rounded bg-gray-100"
              />

              <div className="text-xs">{getStockLabel(it.stock)}</div>

              <button
                type="button"
                onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                className="text-red-500 font-bold hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="bg-green-300 hover:bg-green-600 text-white px-4 py-2 rounded mt-2"
          >
            ➕ Add Item
          </button>
        </div>

        {/* 💰 Total + Save */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-xl font-bold text-gray-700">
            Total: ₹{totalAmount}
          </div>
          <button
            type="submit"
            className={`px-4 py-1.5 rounded text-white ${
              items.some((i) => i.quantity > (i.stock ?? Infinity))
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
            disabled={items.some((i) => i.quantity > (i.stock ?? Infinity))}
          >
            {editId ? "Update Sale" : "Save Sale"}
          </button>
        </div>
      </form>

      {/* 📋 All Sales */}
      <h3 className="text-lg font-bold mt-8 mb-2 text-gray-800">📋 All Sales</h3>
      <table className="w-full border-collapse border border-gray-300 text-center rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-left text-sm font-medium text-gray-700">
          <tr>
            <th className="border p-2">Customer</th>
            <th className="border p-2">Invoice</th>
            <th className="border p-2">Total</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s._id} className="hover:bg-gray-50">
              <td className="border p-2">{s.customerId?.customer_name}</td>
              <td className="border p-2">{s.invoiceNo}</td>
              <td className="border p-2">₹{s.totalAmount}</td>
              <td className="border p-2">
                {new Date(s.date).toLocaleDateString()}
              </td>
              <td className="border p-2 flex justify-center gap-2">
                <button
                  onClick={() => handleEdit(s)}
                  className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(s._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
                <button
                  onClick={() => handlePrint(s)}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                >
                  🖨️ Print
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🖨️ Bill Print */}
      {selectedSale && (
        <SalesBillPrint
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
        />
      )}
    </div>
  );
}
