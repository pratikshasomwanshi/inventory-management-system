import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  customerId: { type: String, default: () => `CUST-${Date.now()}` },
  customer_name: { type: String, required: true },
  contact_number: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Customer", customerSchema);
