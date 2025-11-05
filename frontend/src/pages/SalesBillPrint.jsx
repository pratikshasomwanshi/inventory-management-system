import React from "react";

export default function SalesBillPrint({ sale, onClose }) {
  if (!sale) return null;

  // ✅ Trigger print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[800px] relative print:w-full print:shadow-none print:rounded-none">
        {/* Close button (hidden when printing) */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-500 hover:text-red-600 font-bold text-xl print:hidden"
        >
          ✕
        </button>

        {/* Invoice Header */}
        <h2 className="text-2xl font-bold text-center mb-4 text-blue-700">
          🧾 Sales Invoice
        </h2>

        <div className="flex justify-between mb-4 text-sm">
          <div>
            <p><strong>Invoice No:</strong> {sale.invoiceNo}</p>
            <p><strong>Date:</strong> {new Date(sale.date).toLocaleDateString()}</p>
          </div>
          <div>
            <p><strong>Customer:</strong> {sale.customerId?.customer_name}</p>
            <p><strong>Contact:</strong> {sale.customerId?.contact || "N/A"}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse border text-center text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="border p-2">#</th>
              <th className="border p-2">Product</th>
              <th className="border p-2">Qty</th>
              <th className="border p-2">Price (₹)</th>
              <th className="border p-2">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {sale.details?.map((item, i) => (
              <tr key={i}>
                <td className="border p-2">{i + 1}</td>
                <td className="border p-2">{item.productId?.product_name}</td>
                <td className="border p-2">{item.quantity}</td>
                <td className="border p-2">{item.price}</td>
                <td className="border p-2">{item.quantity * item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div className="text-right mt-4 text-lg font-bold">
          Grand Total: ₹{sale.totalAmount}
        </div>

        {/* Print button */}
        <div className="text-center mt-6 print:hidden">
          <button
            onClick={handlePrint}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded"
          >
            🖨️ Print Bill
          </button>
        </div>
      </div>
    </div>
  );
}
