import React, { useEffect, useState } from "react";
import api from "../api/api";
import { z } from "zod";
import { toast, Toaster } from "react-hot-toast";

// ✅ Define Zod schema for validation
const customerSchema = z.object({
  customer_name: z.string().min(2, "Customer name is required"),
  contact_number: z
    .string()
    .regex(/^\d{10}$/, "Contact number must be 10 digits"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(3, "Address is required"),
});

export default function Customer() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch all customers
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/customers");
      setCustomers(res.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
      toast.error("❌ Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete customer (with toast confirmation)
  const handleDelete = async (id) => {
    toast((t) => (
      <div>
        <p>🗑️ Are you sure you want to delete this customer?</p>
        <div className="flex justify-center gap-2 mt-2">
          <button
            onClick={async () => {
              try {
                await api.delete(`/customers/${id}`);
                toast.success("✅ Customer deleted successfully!");
                fetchCustomers();
              } catch (err) {
                toast.error("❌ Failed to delete customer");
              } finally {
                toast.dismiss(t.id);
              }
            }}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-300 text-gray-800 px-3 py-1 rounded"
          >
            No
          </button>
        </div>
      </div>
    ));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-2xl shadow-lg mt-6">
      <Toaster position="top-center" />
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">
        👥 Customer Management
      </h1>

      {/* ✅ Form */}
      <CustomerForm
        selectedCustomer={selectedCustomer}
        refreshCustomers={fetchCustomers}
        clearSelected={() => setSelectedCustomer(null)}
      />

      {/* ✅ Table */}
      <div className="mt-10 overflow-x-auto">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            All Customers
          </h2>
          <button
            onClick={fetchCustomers}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded"
          >
            🔄 Refresh
          </button>
        </div>

        <table className="min-w-full bg-white border rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-medium text-gray-700">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Contact</th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Address</th>
              <th className="p-2 border text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">
                  Loading customers...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">
                  No customers available
                </td>
              </tr>
            ) : (
              customers.map((cust) => (
                <tr
                  key={cust._id}
                  className="text-sm hover:bg-gray-50 transition-all"
                >
                  <td className="p-2 border">{cust.customer_name}</td>
                  <td className="p-2 border">{cust.contact_number}</td>
                  <td className="p-2 border">{cust.email}</td>
                  <td className="p-2 border">{cust.address}</td>
                  {/* <td className="p-2 border text-center space-x-2">
                    <button
                      onClick={() => setSelectedCustomer(cust)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cust._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      🗑️ Delete
                    </button>
                  </td> */}<td className="border p-2">
  <div className="flex justify-center items-center gap-2">
    <button
      onClick={() => setSelectedCustomer(cust)}
      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
    >
      ✏️ Edit
    </button>
    <button
      onClick={() => handleDelete(cust._id)}
      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
    >
      🗑️ Delete
    </button>
  </div>
</td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ✅ Customer Form Component
function CustomerForm({ selectedCustomer, refreshCustomers, clearSelected }) {
  const [formData, setFormData] = useState({
    customer_name: "",
    contact_number: "",
    email: "",
    address: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (selectedCustomer) {
      setFormData({
        customer_name: selectedCustomer.customer_name,
        contact_number: selectedCustomer.contact_number,
        email: selectedCustomer.email,
        address: selectedCustomer.address,
      });
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [selectedCustomer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validate using Zod
    const result = customerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      if (selectedCustomer) {
        await api.put(`/customers/${selectedCustomer._id}`, formData);
        toast.success("✅ Customer updated successfully!");
      } else {
        await api.post("/customers", formData);
        toast.success("✅ Customer added successfully!");
      }

      setFormData({
        customer_name: "",
        contact_number: "",
        email: "",
        address: "",
      });
      setErrors({});
      clearSelected();
      refreshCustomers();
    } catch (err) {
      console.error("Error saving customer:", err);
      toast.error("❌ Failed to save customer.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-5 rounded-lg shadow-md grid grid-cols-2 gap-4"
    >
      <div>
        <input
          type="text"
          name="customer_name"
          placeholder="Customer Name"
          value={formData.customer_name}
          onChange={handleChange}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
        />
        {errors.customer_name && (
          <p className="text-red-500 text-sm mt-1">{errors.customer_name}</p>
        )}
      </div>

      <div>
        <input
          type="text"
          name="contact_number"
          placeholder="Contact Number"
          value={formData.contact_number}
          onChange={handleChange}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
        />
        {errors.contact_number && (
          <p className="text-red-500 text-sm mt-1">{errors.contact_number}</p>
        )}
      </div>

      <div>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <input
          type="text"
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400"
        />
        {errors.address && (
          <p className="text-red-500 text-sm mt-1">{errors.address}</p>
        )}
      </div>

      <button
        type="submit"
        className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-semibold transition-all"
      >
        {selectedCustomer ? "💾 Update Customer" : "➕ Add Customer"}
      </button>
    </form>
  );
}
