import AdminLayout from "./components/AdminLayout";
import DashboardHome from "./pages/DashboardHome";
import AddProductForm from "./pages/AddProductForm";
import ProductTable from "./pages/ProductTable";
import AdminLogin from "./pages/AdminLogin";
import ProtectedAdminRoute from "./ProtectedAdminRoute";
import ThemeSettings from "./pages/ThemeSetting";
import EditProduct from "../pages/EditProduct";
import StatusSettings from "./pages/StatusSettings";
import AdminCollections from "./pages/AdminCollections";

export const ADMIN_ROUTES = [
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/admin",
    element: (
      <ProtectedAdminRoute>
        <AdminLayout />
      </ProtectedAdminRoute>
    ),
    children: [
      { index: true, element: <DashboardHome /> },
      { path: "products", element: <ProductTable /> },
      { path: "products/add", element: <AddProductForm /> },
      { path: "products/edit/:id", element: <EditProduct /> },
      { path: "themes", element: <ThemeSettings /> },
      { path: "status", element: <StatusSettings /> },
      { path: "collections", element: <AdminCollections /> },
    ],
  },
];
