import SalesMaster from "../models/salesMasterModel.js";
import SalesDetails from "../models/salesDetailsModel.js";
import PurchaseMaster from "../models/purchaseMasterModel.js";
import PurchaseDetails from "../models/purchaseDetailsModel.js";
import Product from "../models/productModel.js";

/* =========================================================================
 🧾 SALES REPORT (with Datewise Grand Total)
===========================================================================*/
export const getSalesReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFilter = {};
    if (from && to) {
      dateFilter.date = { $gte: new Date(from), $lte: new Date(to) };
    }

    const salesMasters = await SalesMaster.find(dateFilter)
      .populate("customerId", "customer_name")
      .sort({ date: -1 });

    let report = [];

    for (const master of salesMasters) {
      const details = await SalesDetails.find({
        salesMasterId: master._id,
      }).populate("productId", "product_name category costprice");

      const entries = details.map((item) => {
        const costPrice = item.productId?.costprice || 0;
        const profitPerUnit = item.price - costPrice;
        const totalProfit = profitPerUnit * item.quantity;

        return {
          Date: master.date.toISOString().split("T")[0],
          InvoiceNo: master.invoiceNo,
          CustomerName: master.customerId?.customer_name || "Unknown",
          ProductName: item.productId?.product_name || "Unknown",
          Category: item.productId?.category || "N/A",
          Quantity: item.quantity,
          SellingPrice: item.price,
          CostPrice: costPrice,
          ProfitPerUnit: profitPerUnit,
          TotalProfit: totalProfit,
          TotalAmount: item.quantity * item.price,
        };
      });

      report.push(...entries);
    }

    // ✅ Group by Date + Customer (Subtotal per day)
    const grouped = {};
    for (const r of report) {
      const key = `${r.Date}_${r.CustomerName}`;
      if (!grouped[key]) grouped[key] = { rows: [], grandTotal: 0 };
      grouped[key].rows.push(r);
      grouped[key].grandTotal += r.TotalAmount;
    }

    // ✅ Flatten grouped structure
    const finalReport = [];
    for (const [key, value] of Object.entries(grouped)) {
      const [date, customer] = key.split("_");
      value.rows.forEach((r) => finalReport.push(r));

      finalReport.push({
        Date: date,
        CustomerName: `${customer} (Subtotal)`,
        ProductName: "",
        Category: "",
        Quantity: "",
        SellingPrice: "",
        CostPrice: "",
        ProfitPerUnit: "",
        TotalProfit: "",
        TotalAmount: value.grandTotal,
      });
    }

    res.json({ ok: true, data: finalReport });
  } catch (err) {
    console.error("❌ Sales report error:", err);
    res.status(500).json({
      ok: false,
      message: "Server error in Sales report",
    });
  }
};

/* =========================================================================
 🧾 PURCHASE REPORT (with Datewise Grand Total)
===========================================================================*/
export const getPurchaseReport = async (req, res) => {
  try {
    const { from, to } = req.query;
    const dateFilter = {};
    if (from && to) {
      dateFilter.date = { $gte: new Date(from), $lte: new Date(to) };
    }

    const purchaseMasters = await PurchaseMaster.find(dateFilter)
      .populate("supplierId", "supplier_name")
      .sort({ date: -1 });

    let report = [];

    for (const master of purchaseMasters) {
      const details = await PurchaseDetails.find({
        purchaseMasterId: master._id,
      }).populate("productId", "product_name category rate");

      const entries = details.map((item) => ({
        Date: master.date.toISOString().split("T")[0],
        BillNo: master._id.toString().slice(-6).toUpperCase(),
        SupplierName: master.supplierId?.supplier_name || "Unknown",
        ProductName: item.productId?.product_name || "Unknown",
        Category: item.productId?.category || "N/A",
        Quantity: item.quantity,
        Rate: item.rate,
        TotalAmount: item.quantity * item.rate,
      }));

      report.push(...entries);
    }

    // ✅ Group by Date + Supplier (Subtotal per day)
    const grouped = {};
    for (const r of report) {
      const key = `${r.Date}_${r.SupplierName}`;
      if (!grouped[key]) grouped[key] = { rows: [], grandTotal: 0 };
      grouped[key].rows.push(r);
      grouped[key].grandTotal += r.TotalAmount;
    }

    // ✅ Flatten grouped structure
    const finalReport = [];
    for (const [key, value] of Object.entries(grouped)) {
      const [date, supplier] = key.split("_");
      value.rows.forEach((r) => finalReport.push(r));

      finalReport.push({
        Date: date,
        SupplierName: `${supplier} (Subtotal)`,
        ProductName: "",
        Category: "",
        Quantity: "",
        Rate: "",
        TotalAmount: value.grandTotal,
      });
    }

    res.json({ ok: true, data: finalReport });
  } catch (err) {
    console.error("❌ Purchase report error:", err);
    res.status(500).json({
      ok: false,
      message: "Server error in Purchase report",
    });
  }
};

/* =========================================================================
 📊 DASHBOARD SUMMARY
===========================================================================*/
export const getDashboardSummary = async (req, res) => {
  try {
    const totalSalesAgg = await SalesMaster.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalSales = totalSalesAgg[0]?.total || 0;

    const totalPurchaseAgg = await PurchaseMaster.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalPurchase = totalPurchaseAgg[0]?.total || 0;

    const totalProducts = await Product.countDocuments();

    const closingStockAgg = await Product.aggregate([
      { $match: { qty: { $gt: 0 } } },
      { $group: { _id: null, totalQty: { $sum: "$qty" } } },
    ]);
    const closingStock = closingStockAgg[0]?.totalQty || 0;

    res.json({
      totalProducts,
      totalSales,
      totalPurchase,
      closingStock,
    });
  } catch (error) {
    console.error("❌ Dashboard Summary Error:", error);
    res.status(500).json({ message: "Failed to load dashboard summary" });
  }
};

/* =========================================================================
 📈 MONTH-WISE SALES GRAPH
===========================================================================*/
export const getMonthlySales = async (req, res) => {
  try {
    const salesByMonth = await SalesMaster.aggregate([
      {
        $group: {
          _id: { $month: "$date" },
          total: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id": 1 } },
    ]);

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const formatted = salesByMonth.map((m) => ({
      month: months[m._id - 1],
      total: m.total,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("❌ Monthly Sales Error:", error);
    res.status(500).json({ message: "Failed to load monthly sales data" });
  }
};

/* =========================================================================
 🍩 TOP SELLING PRODUCTS
===========================================================================*/
export const getTopProducts = async (req, res) => {
  try {
    const salesAgg = await SalesDetails.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$product.product_name",
          totalSales: { $sum: "$amount" },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 6 },
    ]);

    const cleanData = salesAgg
      .filter((p) => p._id && p._id !== "Unknown")
      .map((p) => ({
        product: p._id,
        totalSales: p.totalSales,
      }));

    res.json(cleanData);
  } catch (error) {
    console.error("❌ Top Products Error:", error);
    res.status(500).json({ message: "Failed to load top products" });
  }
};

/* =========================================================================
 📦 STOCK DISTRIBUTION
===========================================================================*/
export const getStockDistribution = async (req, res) => {
  try {
    const stockAgg = await Product.aggregate([
      {
        $match: {
          product_name: { $exists: true, $ne: "Unknown" },
          qty: { $gt: 0 },
        },
      },
      {
        $project: {
          _id: 0,
          product: "$product_name",
          stockQty: "$qty",
        },
      },
    ]);

    res.json(stockAgg);
  } catch (error) {
    console.error("❌ Stock Distribution Error:", error);
    res.status(500).json({ message: "Failed to load stock distribution" });
  }
};

/* =========================================================================
 🧾 SALES SUMMARY REPORT (Grouped by Invoice)
===========================================================================*/
export const getSalesSummary = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = {};
    if (from && to) {
      filter.date = { $gte: new Date(from), $lte: new Date(to) };
    }

    const sales = await SalesMaster.find(filter)
      .populate("customerId", "customer_name")
      .sort({ date: -1 });

    const summary = await Promise.all(
      sales.map(async (sale) => {
        const details = await SalesDetails.find({
          salesMasterId: sale._id,
        });
        const productCount = details.length;
        return {
          InvoiceNo: sale.invoiceNo,
          CustomerName: sale.customerId?.customer_name || "Unknown",
          ProductCount: productCount,
          TotalAmount: sale.totalAmount,
          Date: sale.date.toISOString().split("T")[0],
        };
      })
    );

    res.status(200).json({ ok: true, data: summary });
  } catch (error) {
    console.error("❌ Sales Summary Report Error:", error);
    res.status(500).json({ message: "Failed to load sales summary report" });
  }
};

/* =========================================================================
 🧾 PURCHASE SUMMARY REPORT (Grouped by Bill)
===========================================================================*/
export const getPurchaseSummary = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = {};
    if (from && to) {
      filter.date = { $gte: new Date(from), $lte: new Date(to) };
    }

    const purchases = await PurchaseMaster.find(filter)
      .populate("supplierId", "supplier_name")
      .sort({ date: -1 });

    const summary = await Promise.all(
      purchases.map(async (purchase) => {
        const details = await PurchaseDetails.find({
          purchaseMasterId: purchase._id,
        });
        const productCount = details.length;

        return {
          BillNo: purchase._id.toString().slice(-6).toUpperCase(),
          SupplierName: purchase.supplierId?.supplier_name || "Unknown",
          ProductCount: productCount,
          TotalAmount: purchase.totalAmount,
          Date: purchase.date.toISOString().split("T")[0],
        };
      })
    );

    res.status(200).json({ ok: true, data: summary });
  } catch (error) {
    console.error("❌ Purchase Summary Report Error:", error);
    res
      .status(500)
      .json({ message: "Failed to load purchase summary report" });
  }
};
