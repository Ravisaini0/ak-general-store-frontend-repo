import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Home from "../pages/user/Home";
import Login from "../pages/user/Login";
import Register from "../pages/user/Register";
import ProductListing from "../pages/user/ProductListing";
import ProductDetails from "../pages/user/ProductDetails";
import Cart from "../pages/user/Cart";
import Checkout from "../pages/user/Checkout";
import OrderSuccess from "../pages/user/OrderSuccess";
import MyOrders from "../pages/user/MyOrders";
import OrderTracking from "../pages/user/OrderTracking";
import Profile from "../pages/user/Profile";
import AddressBook from "../pages/user/AddressBook";
import Wishlist from "../pages/user/Wishlist";
import ForgotPassword from "../pages/user/ForgotPassword";
import OtpVerify from "../pages/user/OtpVerify";
import AataChakkiBooking from "../pages/user/AataChakkiBooking";
import Offers from "../pages/user/Offers";

export default function UserRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/otp-verify" element={<OtpVerify />} />
      <Route path="/offers" element={<Offers />} />
      <Route path="/products" element={<ProductListing />} />
      <Route path="/category/:slug" element={<ProductListing />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/cart" element={<Cart />} />

      <Route element={<ProtectedRoute role="user" />}>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/tracking/:orderNumber" element={<OrderTracking />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/address-book" element={<AddressBook />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/aata-chakki-booking" element={<AataChakkiBooking />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
