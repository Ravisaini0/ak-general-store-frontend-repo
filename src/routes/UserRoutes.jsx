import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

const Home = lazy(() => import("../pages/user/Home"));
const Login = lazy(() => import("../pages/user/Login"));
const Register = lazy(() => import("../pages/user/Register"));
const ProductListing = lazy(() => import("../pages/user/ProductListing"));
const ProductDetails = lazy(() => import("../pages/user/ProductDetails"));
const Cart = lazy(() => import("../pages/user/Cart"));
const Checkout = lazy(() => import("../pages/user/Checkout"));
const OrderSuccess = lazy(() => import("../pages/user/OrderSuccess"));
const MyOrders = lazy(() => import("../pages/user/MyOrders"));
const OrderTracking = lazy(() => import("../pages/user/OrderTracking"));
const Profile = lazy(() => import("../pages/user/Profile"));
const AddressBook = lazy(() => import("../pages/user/AddressBook"));
const Wishlist = lazy(() => import("../pages/user/Wishlist"));
const ForgotPassword = lazy(() => import("../pages/user/ForgotPassword"));
const OtpVerify = lazy(() => import("../pages/user/OtpVerify"));
const AataChakkiBooking = lazy(() => import("../pages/user/AataChakkiBooking"));
const Offers = lazy(() => import("../pages/user/Offers"));
const AboutUs = lazy(() => import("../pages/user/AboutUs"));
const PrivacyPolicy = lazy(() => import("../pages/user/PrivacyPolicy"));
const TermsConditions = lazy(() => import("../pages/user/TermsConditions"));
const ReturnRefundPolicy = lazy(() => import("../pages/user/ReturnRefundPolicy"));

export default function UserRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/otp-verify" element={<OtpVerify />} />
      <Route path="/offers" element={<Offers />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-and-conditions" element={<TermsConditions />} />
      <Route path="/return-refund-policy" element={<ReturnRefundPolicy />} />
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
