import { Routes, Route } from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import CheckoutPage from "@/pages/CheckoutPage";
import TrackingPage from "@/pages/TrackingPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/track" element={<TrackingPage />} />
      <Route path="/track/:orderCode" element={<TrackingPage />} />
    </Routes>
  );
}

export default App;
