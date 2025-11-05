import express from "express";
import {
  getSalesReport,
  getSalesSummary,
  getPurchaseReport,
  getPurchaseSummary,
  getDashboardSummary,
  getMonthlySales,
  getTopProducts,
  getStockDistribution,
} from "../controllers/reportController.js";

const router = express.Router();

/* =========================================================================
 🧾 SALES REPORT ROUTES
===========================================================================*/
// 🔹 Detailed Sales Report (Datewise + Product details + Subtotals)
router.get("/sales-report", getSalesReport);

// 🔹 Summary Sales Report (Grouped by Invoice)
router.get("/sales-summary", getSalesSummary);

/* =========================================================================
 📦 PURCHASE REPORT ROUTES
===========================================================================*/
// 🔹 Detailed Purchase Report (Datewise + Product details + Subtotals)
router.get("/purchase-report", getPurchaseReport);

// 🔹 Summary Purchase Report (Grouped by Bill)
router.get("/purchase-summary", getPurchaseSummary);

/* =========================================================================
 📊 DASHBOARD & ANALYTICS ROUTES
===========================================================================*/
// 🔹 Dashboard summary cards (totals for sales, purchase, stock)
router.get("/summary", getDashboardSummary);

// 🔹 Monthly sales chart
router.get("/monthly-sales", getMonthlySales);

// 🔹 Top 6 selling products (Pie Chart)
router.get("/top-products", getTopProducts);

// 🔹 Stock distribution (Pie Chart)
router.get("/stock-distribution", getStockDistribution);

export default router;
