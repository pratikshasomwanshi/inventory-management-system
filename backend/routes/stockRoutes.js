import express from "express";
import { getStockView, getProductStock } from "../controllers/stockController.js";

const router = express.Router();

// ✅ Get all stock summary
router.get("/", getStockView);

// ✅ Get single product stock (used by Sales.jsx)
router.get("/product/:id", getProductStock);

export default router;
