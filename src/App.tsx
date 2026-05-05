import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/authContext";

// Public pages
import LandingPage from "@/pages/LandingPage";
import CheckoutPage from "@/pages/CheckoutPage";
import TrackingPage from "@/pages/TrackingPage";

// Admin pages
import AdminLayout from "@/layouts/AdminLayout";
import AdminLoginPage from "@/pages/admin/LoginPage";
import AdminDashboardPage from "@/pages/admin/DashboardPage";
import AdminOrdersPage from "@/pages/admin/OrdersPage";
import AdminOrderDetailPage from "@/pages/admin/OrderDetailPage";
import {
  AdminProductsPage,
  AdminContentPage,
  AdminVouchersPage,
  AdminReviewsPage,
  AdminWithdrawalPage,
  AdminSettingsPage,
} from "@/pages/admin/Placeholders";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* ========== PUBLIC ========== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/track" element={<TrackingPage />} />
        <Route path="/track/:orderCode" element={<TrackingPage />} />

        {/* ========== ADMIN LOGIN (no layout) ========== */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* ========== ADMIN (with layout + auth guard) ========== */}
        <Route
          path="/admin"
          element={
            <AdminLayout>
              <AdminDashboardPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminLayout>
              <AdminOrdersPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/orders/:id"
          element={
            <AdminLayout>
              <AdminOrderDetailPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminLayout>
              <AdminProductsPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/content"
          element={
            <AdminLayout>
              <AdminContentPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/vouchers"
          element={
            <AdminLayout>
              <AdminVouchersPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/reviews"
          element={
            <AdminLayout>
              <AdminReviewsPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/withdrawal"
          element={
            <AdminLayout>
              <AdminWithdrawalPage />
            </AdminLayout>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <AdminLayout>
              <AdminSettingsPage />
            </AdminLayout>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
