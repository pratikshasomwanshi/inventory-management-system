import { useEffect, useState } from "react";
import axios from "axios";

export default function Stock() {
  const [stockData, setStockData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ Fetch Stock Data
  const fetchStock = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/stocks");
      setStockData(res.data);
    } catch (error) {
      console.error("Error fetching stock data:", error);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  // 🔍 Filter products by name
  const filteredStock = stockData.filter((item) =>
    item.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">📦 Stock Summary</h2>

      {/* 🔍 Search Bar */}
      <div className="mb-4 flex justify-end">
        <input
          type="text"
          placeholder="Search Product..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-64 focus:ring-2 focus:ring-blue-400 outline-none"
        />
      </div>

      {/* 📋 Stock Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg shadow-md">
          <thead className="bg-blue-500 text-white">
            <tr>
              <th className="p-2 text-left">Sr.No</th>
              <th className="p-2 text-left">Product Name</th>
              <th className="p-2 text-center">Opening Stock</th>
              <th className="p-2 text-center">Purchase Inward</th>
              <th className="p-2 text-center">Sales Outward</th>
              <th className="p-2 text-center">Closing Stock</th>
            </tr>
          </thead>
          <tbody>
            {filteredStock.length > 0 ? (
              filteredStock.map((item, i) => (
                <tr
                  key={i}
                  className="border-b hover:bg-gray-100 transition"
                >
                  <td className="p-2 text-left">{item.srNo}</td>
                  <td className="p-2">{item.product_name}</td>
                  <td className="p-2 text-center">{item.openingStock}</td>
                  <td className="p-2 text-center text-green-700 font-semibold">
                    {item.purchaseInward}
                  </td>
                  <td className="p-2 text-center text-red-700 font-semibold">
                    {item.salesOutward}
                  </td>
                  <td className="p-2 text-center font-bold text-blue-700">
                    {item.closingStock}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center p-4 text-gray-500 italic"
                >
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
