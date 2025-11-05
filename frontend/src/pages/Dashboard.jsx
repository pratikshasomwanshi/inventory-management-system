import React, { useEffect, useState } from "react";
import api from "../api/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Package,
  ShoppingCart,
  DollarSign,
  Boxes,
  RefreshCw,
} from "lucide-react";

// 🎨 Pie chart colors
const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#ec4899"];

export default function Dashboard() {
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalSales: 0,
    totalPurchase: 0,
    closingStock: 0,
  });
  const [monthlySales, setMonthlySales] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [stockDistribution, setStockDistribution] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch Dashboard Data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, monthlyRes, topRes, stockRes] = await Promise.all([
        api.get("/reports/summary"),
        api.get("/reports/monthly-sales"),
        api.get("/reports/top-products"),
        api.get("/reports/stock-distribution"),
      ]);

      setSummary(summaryRes.data);
      setMonthlySales(monthlyRes.data);
      setTopProducts(topRes.data);
      setStockDistribution(stockRes.data);
    } catch (error) {
      console.error("❌ Dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // 🎯 Format large numbers nicely
  const formatNumber = (num) =>
    num?.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header + Refresh */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          📊 Dashboard
        </h1>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 shadow-md"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center mt-20">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!loading && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Products */}
            <div className="bg-white rounded-2xl shadow-md p-5 border-t-4 border-purple-500 flex justify-between items-center hover:shadow-lg transition-all">
              <div>
                <h2 className="text-gray-600 font-semibold">Total Products</h2>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {formatNumber(summary.totalProducts)}
                </p>
              </div>
              <Package className="text-purple-500 w-10 h-10" />
            </div>

            {/* Total Sales */}
            <div className="bg-white rounded-2xl shadow-md p-5 border-t-4 border-pink-500 flex justify-between items-center hover:shadow-lg transition-all">
              <div>
                <h2 className="text-gray-600 font-semibold">Total Sales</h2>
                <p className="text-3xl font-bold text-pink-600 mt-2">
                  ₹{formatNumber(summary.totalSales)}
                </p>
              </div>
              <ShoppingCart className="text-pink-500 w-10 h-10" />
            </div>

            {/* Total Purchase */}
            <div className="bg-white rounded-2xl shadow-md p-5 border-t-4 border-blue-500 flex justify-between items-center hover:shadow-lg transition-all">
              <div>
                <h2 className="text-gray-600 font-semibold">Total Purchases</h2>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  ₹{formatNumber(summary.totalPurchase)}
                </p>
              </div>
              <DollarSign className="text-blue-500 w-10 h-10" />
            </div>

            {/* Closing Stock */}
            <div className="bg-white rounded-2xl shadow-md p-5 border-t-4 border-yellow-500 flex justify-between items-center hover:shadow-lg transition-all">
              <div>
                <h2 className="text-gray-600 font-semibold">Closing Stock</h2>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {formatNumber(summary.closingStock)} Units
                </p>
              </div>
              <Boxes className="text-yellow-500 w-10 h-10" />
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            {/* 📊 Monthly Sales */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Sales Trend (Last 7 Days)
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlySales}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(val) => `₹${formatNumber(val)}`} />
                  <Bar
                    dataKey="total"
                    fill="#3b82f6"
                    barSize={40}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 🍩 Top Selling Products */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                Top Selling Products
              </h2>
              {topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={topProducts}
                      dataKey="totalSales"
                      nameKey="product"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      label={({ product }) => product}
                    >
                      {topProducts.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, _, entry) => [
                        `₹${formatNumber(value)}`,
                        entry.payload.product,
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-center">No sales data.</p>
              )}
            </div>
          </div>

          {/* 📦 Stock Distribution */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Stock Distribution
            </h2>
            {stockDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stockDistribution}
                    dataKey="stockQty"
                    nameKey="product"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={({ product }) => product}
                  >
                    {stockDistribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, _, entry) => [
                      `${formatNumber(value)} Units`,
                      entry.payload.product,
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center">
                No product stock data found.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
