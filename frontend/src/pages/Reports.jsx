import React, { useState } from "react";
import * as XLSX from "xlsx";

const API_BASE = "http://localhost:8000/api/reports";

const Report = () => {
  const [reportType, setReportType] = useState("sales");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalData, setModalData] = useState(null);
  const [modalType, setModalType] = useState("");

  // ✅ Fetch Summary Report
  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");

      const endpoint =
        reportType === "sales" ? "sales-summary" : "purchase-summary";

      const res = await fetch(
        `${API_BASE}/${endpoint}?from=${fromDate}&to=${toDate}`
      );
      const result = await res.json();

      if (result.ok && result.data.length > 0) {
        setData(result.data);
      } else {
        setData([]);
        setError("No data found");
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching report");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch Detailed Report — grouped by INVOICE NO
  const fetchDetailedReport = async (id) => {
    try {
      const endpoint =
        reportType === "sales" ? "sales-report" : "purchase-report";
      const res = await fetch(`${API_BASE}/${endpoint}?id=${id}`);
      const result = await res.json();

      if (result.ok && result.data.length > 0) {
        // 1️⃣ Group by Invoice No / Bill No
        const grouped = {};
        result.data.forEach((item) => {
          const key =
            item.InvoiceNo ||
            item.BillNo ||
            item.invoiceNo ||
            item.billNo ||
            "Unknown";
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(item);
        });

        // 2️⃣ Build array with subtotal row per invoice
        const finalData = [];
        Object.keys(grouped).forEach((invoice) => {
          let subtotal = 0;

          grouped[invoice].forEach((row) => {
            const qty = Number(row.Quantity || 0);
            const price =
              Number(row.SellingPrice || row.Rate || row.price || row.rate || 0);
            const total = qty * price;
            subtotal += total;

            finalData.push({
              ...row,
              TotalAmount: total,
            });
          });

          // Add subtotal row for that invoice
          const first = grouped[invoice][0];
          finalData.push({
            Date: first.Date,
            InvoiceNo: `${invoice} (Subtotal)`,
            CustomerName: first.CustomerName || first.SupplierName || "",
            ProductName: "",
            Quantity: "",
            SellingPrice: "",
            Rate: "",
            TotalAmount: subtotal,
            _isSubtotal: true,
          });
        });

        setModalType("Detailed");
        setModalData(finalData);
      } else {
        alert("No detailed data found for this record.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch detailed report.");
    }
  };

  // ✅ Fetch Summary Report (modal)
  const fetchSummaryReport = async (id) => {
    try {
      const endpoint =
        reportType === "sales" ? "sales-summary" : "purchase-summary";
      const res = await fetch(`${API_BASE}/${endpoint}?id=${id}`);
      const result = await res.json();

      if (result.ok && result.data.length > 0) {
        setModalType("Summary");
        setModalData(result.data);
      } else {
        alert("No summary data found for this record.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch summary report.");
    }
  };

  // ✅ Download Excel
  const downloadExcel = () => {
    if (data.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `${reportType}-summary-report.xlsx`);
  };

  const closeModal = () => {
    setModalData(null);
    setModalType("");
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        📊 {reportType === "sales" ? "Sales Reports" : "Purchase Reports"}
      </h1>

      {/* 🔹 Report Type Toggle */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setReportType("sales")}
          className={`px-4 py-2 rounded-lg font-semibold ${
            reportType === "sales"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          🧾 Sales
        </button>
        <button
          onClick={() => setReportType("purchase")}
          className={`px-4 py-2 rounded-lg font-semibold ${
            reportType === "purchase"
              ? "bg-amber-600 text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
        >
          📦 Purchase
        </button>
      </div>

      {/* 🔹 Date Filters */}
      <div className="flex flex-wrap gap-4 justify-center items-end mb-6">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border rounded-lg px-3 py-2"
          />
        </div>
        <button
          onClick={fetchReport}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Generate
        </button>
      </div>

      {/* 🔹 Export Button */}
      {data.length > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={downloadExcel}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            ⬇️ Download Excel
          </button>
        </div>
      )}

      {/* 🔹 Summary Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-500">No data found</p>
        ) : (
          <table className="min-w-full border border-gray-300 text-sm rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                {Object.keys(data[0]).map((key) => (
                  <th key={key} className="border px-3 py-2 capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </th>
                ))}
                <th className="border px-3 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  {Object.values(row).map((val, i) => (
                    <td key={i} className="border px-3 py-2">
                      {typeof val === "number"
                        ? val.toLocaleString("en-IN")
                        : val}
                    </td>
                  ))}
                  <td className="border px-3 py-2 text-center">
                    <button
                      onClick={() =>
                        fetchDetailedReport(
                          row.InvoiceNo || row.BillNo || row._id
                        )
                      }
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 mr-2"
                    >
                      Detailed
                    </button>
                    <button
                      onClick={() =>
                        fetchSummaryReport(
                          row.InvoiceNo || row.BillNo || row._id
                        )
                      }
                      className="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600"
                    >
                      Summary
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 🔹 Modal for Detailed/Summary */}
      {modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 p-6 relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={closeModal}
              className="absolute top-3 right-4 text-gray-600 text-xl hover:text-red-600"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4 text-center text-blue-700">
              {modalType === "Detailed"
                ? "🧾 Detailed Report (Invoice-wise Subtotal)"
                : "📊 Summary Report"}
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    {Object.keys(modalData[0]).map((key) => (
                      <th key={key} className="border px-3 py-2 capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {modalData.map((row, idx) => (
                    <tr
                      key={idx}
                      className={
                        row._isSubtotal
                          ? "bg-gray-200 font-semibold text-black"
                          : "hover:bg-gray-50"
                      }
                    >
                      {Object.values(row).map((val, i) => (
                        <td key={i} className="border px-3 py-2">
                          {typeof val === "number"
                            ? val.toLocaleString("en-IN")
                            : val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Report;
