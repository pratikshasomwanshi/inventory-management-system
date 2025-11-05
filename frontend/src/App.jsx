import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Stock from "./pages/Stock";
import Supplier from "./pages/Supplier";
import Customer from "./pages/Customer";
import Purchase from "./pages/Purchase";
import Sales from "./pages/Sales";
import Reports from "./pages/Reports";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* ✅ Default route to open Dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* ✅ Define your pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<Products />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/supplier" element={<Supplier />} />
        <Route path="/customer" element={<Customer />} />
        <Route path="/purchase" element={<Purchase />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/reports" element={<Reports />} />

        {/* ✅ Fallback: redirect any invalid route to dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
