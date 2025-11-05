import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  const navItems = [
    { name: "Dashboard", path: "/dashboard" }, // 🆕 Added Dashboard
    { name: "Products", path: "/products" },
    { name: "Stock", path: "/stock" },
    { name: "Supplier", path: "/supplier" },
    { name: "Customer", path: "/customer" },
    { name: "Purchase", path: "/purchase" },
    { name: "Sales", path: "/sales" },
    { name: "Reports", path: "/reports" },
  ];

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo / Title */}
        <Link to="/" className="text-2xl font-bold">
          Inventory System
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6">
          {navItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `hover:text-yellow-300 transition-colors duration-200 ${
                    isActive ? "text-yellow-300 font-semibold" : ""
                  }`
                }
              >
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Mobile Menu */}
        <div className="md:hidden flex flex-col space-y-2 bg-blue-700 p-3 rounded-md shadow-md">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `block text-sm hover:text-yellow-300 transition-colors duration-200 ${
                  isActive ? "text-yellow-300 font-semibold" : ""
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
