import { matchPath, useLocation } from "react-router-dom";
import SeoHead from "./SeoHead";

const routeMeta = [
  {
    pattern: "/",
    title: "AK General Store | Grocery Delivery, Daily Essentials & Fresh Flour Service",
    description:
      "Shop groceries, pantry staples, household essentials, and fresh flour service with fast local delivery from AK General Store.",
  },
  {
    pattern: "/login",
    title: "Login | AK General Store",
    description:
      "Login to your AK General Store account to continue shopping, manage addresses, track orders, and access secure checkout.",
  },
  {
    pattern: "/register",
    title: "Create Account | AK General Store",
    description:
      "Create your AK General Store account to place orders, manage delivery addresses, save wishlist items, and track deliveries.",
  },
  {
    pattern: "/forgot-password",
    title: "Reset Password | AK General Store",
    description:
      "Securely reset your AK General Store password using OTP verification and restore access to your customer account.",
  },
  {
    pattern: "/offers",
    title: "Offers & Deals | AK General Store",
    description:
      "Explore current grocery offers, discount codes, and value deals on daily essentials available at AK General Store.",
  },
  {
    pattern: "/products",
    title: "All Products | AK General Store",
    description:
      "Browse the complete grocery catalog including flour, rice, lentils, oils, snacks, spices, and daily essentials.",
  },
  {
    pattern: "/cart",
    title: "Your Cart | AK General Store",
    description:
      "Review your selected grocery items, update quantities, and continue to secure checkout from your AK General Store cart.",
  },
  {
    pattern: "/checkout",
    title: "Secure Checkout | AK General Store",
    description:
      "Complete your grocery order with address confirmation, delivery coverage validation, coupons, and secure payment options.",
    noIndex: true,
  },
  {
    pattern: "/my-orders",
    title: "My Orders | AK General Store",
    description:
      "View order history, delivery progress, and payment details for your AK General Store purchases.",
    noIndex: true,
  },
  {
    pattern: "/profile",
    title: "My Profile | AK General Store",
    description:
      "Manage your profile, account image, and personal shopping details inside your AK General Store account.",
    noIndex: true,
  },
  {
    pattern: "/address-book",
    title: "Address Book | AK General Store",
    description:
      "Save and manage home, office, and other delivery addresses with map-based location selection.",
    noIndex: true,
  },
  {
    pattern: "/wishlist",
    title: "Wishlist | AK General Store",
    description:
      "Review your saved grocery items and move them to cart whenever you are ready to order.",
    noIndex: true,
  },
  {
    pattern: "/aata-chakki-booking",
    title: "Fresh Flour Service | AK General Store",
    description:
      "Book fresh flour grinding service with easy scheduling and local fulfilment through AK General Store.",
  },
  {
    pattern: "/about-us",
    title: "About Us | AK General Store",
    description:
      "Learn about AK General Store, our local grocery delivery service, support channels, store location, and customer trust policies.",
  },
  {
    pattern: "/privacy-policy",
    title: "Privacy Policy | AK General Store",
    description:
      "Read how AK General Store collects, uses, and protects account, delivery, and order information.",
  },
  {
    pattern: "/terms-and-conditions",
    title: "Terms & Conditions | AK General Store",
    description:
      "Review the platform usage, account, ordering, delivery, and operational terms for AK General Store.",
  },
  {
    pattern: "/return-refund-policy",
    title: "Return / Refund Policy | AK General Store",
    description:
      "Understand AK General Store return eligibility, refund review, cancellation, and payment issue handling.",
  },
  {
    pattern: "/admin/login",
    title: "Admin Login | AK General Store",
    description: "Secure admin access for AK General Store operations.",
    noIndex: true,
  },
  {
    pattern: "/admin/*",
    title: "Admin Panel | AK General Store",
    description: "Protected operations dashboard for AK General Store administration.",
    noIndex: true,
  },
  {
    pattern: "/delivery/login",
    title: "Delivery Login | AK General Store",
    description: "Secure delivery partner access for AK General Store fulfilment operations.",
    noIndex: true,
  },
  {
    pattern: "/delivery/*",
    title: "Delivery Panel | AK General Store",
    description: "Protected delivery operations interface for AK General Store.",
    noIndex: true,
  },
];

export default function RouteSeo() {
  const location = useLocation();
  const currentPath = location.pathname;

  const matchedMeta =
    routeMeta.find((item) =>
      matchPath(
        {
          path: item.pattern,
          end: item.pattern === "/",
        },
        currentPath
      )
    ) || routeMeta[0];

  return (
    <SeoHead
      title={matchedMeta.title}
      description={matchedMeta.description}
      noIndex={matchedMeta.noIndex}
    />
  );
}
