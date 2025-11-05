import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
  sr_no: { type: Number, required: true },
  supplier_name: { type: String, required: true },
  contact_number: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
});

export default mongoose.model("Supplier", supplierSchema);
