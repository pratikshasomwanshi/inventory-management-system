import SalesMaster, { salesMasterValidation } from "../models/salesMasterModel.js";
import SalesDetails from "../models/salesDetailsModel.js";
import mongoose from "mongoose";

// 📌 Create Sale (POST /sales)
export const createSale = async (req, res) => {
  try {
    console.log("Incoming Sale Data:", req.body);

    // 🧾 Validate request with Zod
    const validatedData = salesMasterValidation.parse(req.body);

    const { customerId, totalAmount, items, date } = validatedData;

    // Start MongoDB transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    // 🧠 1️⃣ Create Sales Master
    const salesMaster = await SalesMaster.create(
      [
        {
          customerId,
          totalAmount,
          date: date || new Date(),
        },
      ],
      { session }
    );

    const salesMasterId = salesMaster[0]._id;

    // 🧠 2️⃣ Create Sales Details
    const salesDetailsData = items.map((item) => ({
      salesMasterId,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
      amount: item.amount,
    }));

    await SalesDetails.insertMany(salesDetailsData, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "✅ Sale added successfully",
      salesMaster: salesMaster[0],
    });
  } catch (error) {
    console.error("❌ Error creating sale:", error);
    res.status(400).json({ error: error.message });
  }
};

// 📋 Get All Sales (GET /sales)
export const getAllSales = async (req, res) => {
  try {
    const sales = await SalesMaster.find()
      .populate("customerId", "customer_name")
      .sort({ date: -1 });

    // Add sale details to each master
    const salesWithDetails = await Promise.all(
      sales.map(async (sale) => {
        const details = await SalesDetails.find({
          salesMasterId: sale._id,
        }).populate("productId", "product_name");

        return { ...sale._doc, details };
      })
    );

    res.status(200).json(salesWithDetails);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sales" });
  }
};

// 🔍 Get Single Sale by ID (GET /sales/:id)
export const getSaleById = async (req, res) => {
  try {
    const sale = await SalesMaster.findById(req.params.id).populate(
      "customerId",
      "customer_name"
    );

    if (!sale) return res.status(404).json({ error: "Sale not found" });

    const details = await SalesDetails.find({
      salesMasterId: sale._id,
    }).populate("productId", "product_name");

    res.status(200).json({ ...sale._doc, details });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sale" });
  }
};

// ✏️ Update Sale (PUT /sales/:id)
export const updateSale = async (req, res) => {
  try {
    const { customerId, totalAmount, items, date } = req.body;

    // Start transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    // 1️⃣ Update Master
    const salesMaster = await SalesMaster.findByIdAndUpdate(
      req.params.id,
      { customerId, totalAmount, date: date || new Date() },
      { new: true, session }
    );

    if (!salesMaster) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Sale not found" });
    }

    // 2️⃣ Delete old details
    await SalesDetails.deleteMany({ salesMasterId: req.params.id }, { session });

    // 3️⃣ Insert new details
    const newDetails = items.map((i) => ({
      salesMasterId: req.params.id,
      productId: i.productId,
      quantity: i.quantity,
      price: i.price,
      amount: i.amount,
    }));

    await SalesDetails.insertMany(newDetails, { session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "✅ Sale updated successfully", salesMaster });
  } catch (error) {
    console.error("❌ Error updating sale:", error);
    res.status(500).json({ error: "Failed to update sale" });
  }
};

// 🗑️ Delete Sale (DELETE /sales/:id)
export const deleteSale = async (req, res) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    const master = await SalesMaster.findByIdAndDelete(req.params.id, { session });
    if (!master) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Sale not found" });
    }

    await SalesDetails.deleteMany({ salesMasterId: req.params.id }, { session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "🗑️ Sale deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting sale:", error);
    res.status(500).json({ error: "Failed to delete sale" });
  }
};
