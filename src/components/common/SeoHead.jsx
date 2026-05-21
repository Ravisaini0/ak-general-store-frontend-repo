import { useEffect } from "react";

const DEFAULT_TITLE = "AK General Store | Grocery Delivery, Daily Essentials & Fresh Flour Service";
const DEFAULT_DESCRIPTION =
  "Order groceries, pantry staples, daily essentials, and fresh flour service from AK General Store with fast local delivery, secure checkout, and live order tracking.";

function upsertMeta(selector, attributes) {
  if (typeof document === "undefined") {
    return;
  }

  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

export default function SeoHead({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  noIndex = false,
}) {
  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    document.title = title;

    upsertMeta('meta[name="description"]', {
      name: "description",
      content: description,
    });

    upsertMeta('meta[property="og:title"]', {
      property: "og:title",
      content: title,
    });

    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: description,
    });

    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: noIndex ? "noindex, nofollow" : "index, follow",
    });

    if (typeof window !== "undefined") {
      upsertMeta('meta[property="og:url"]', {
        property: "og:url",
        content: window.location.href,
      });
    }
  }, [description, noIndex, title]);

  return null;
}
