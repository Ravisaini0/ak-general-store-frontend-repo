import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import {
  cancelOrder as cancelOrderRequest,
  fetchMyOrders,
  placeOrder as placeOrderRequest,
} from "../services/orderService";
import {
  assignOrderToDelivery,
  fetchAdminOrders,
  updateAdminOrderStatus,
} from "../services/adminService";
import {
  acceptDeliveryOrder,
  fetchDeliveryOrders,
  markDeliveryOrderCompleted,
} from "../services/deliveryService";

const OrderContext = createContext(null);
const DEFAULT_DELIVERY_PARTNER = {
  userId: 3,
  name: "Delivery Partner",
  phone: "9876543210",
  email: "delivery@akstore.com",
};

function mapBackendStatus(status) {
  switch (status) {
    case "PENDING":
      return "ORDER_PLACED";
    case "CONFIRMED":
      return "ADMIN_CONFIRMED";
    case "ACCEPTED":
      return "ASSIGNED_TO_DELIVERY";
    case "PICKED_UP":
    case "OUT_FOR_DELIVERY":
      return "PICKED_BY_DELIVERY";
    case "DELIVERED":
      return "ORDER_COMPLETED";
    case "CANCELLED":
      return "ORDER_CANCELLED";
    default:
      return status || "ORDER_PLACED";
  }
}

function normalizeOrder(order) {
  return {
    orderId: Number(order.orderId || order.id || 0),
    orderNumber: order.orderNumber || `AK${order.orderId || order.id || Date.now()}`,
    userId: Number(order.userId || 0),
    customerName: order.customerName || order.customer || "AK Customer",
    customerEmail: order.customerEmail || "",
    customerPhone: order.customerPhone || "",
    status: mapBackendStatus(order.status),
    backendStatus: order.status || "",
    deliveryBoyId: order.deliveryBoyId || null,
    batchId: order.batchId || null,
    totalAmount: Number(order.totalAmount || order.total || 0),
    subtotalAmount: Number(order.subtotalAmount || order.totalAmount || order.total || 0),
    deliveryFee: Number(order.deliveryFee || 0),
    discountAmount: Number(order.discountAmount || 0),
    couponCode: order.couponCode || "",
    paymentStatus: order.paymentStatus || "PENDING",
    paymentMode: order.paymentMode || order.paymentType || "COD",
    itemNames: order.itemNames || [],
    deliveryAddress: order.deliveryAddress || order.address || "",
    deliveryLatitude: order.deliveryLatitude ?? null,
    deliveryLongitude: order.deliveryLongitude ?? null,
    deliveryLocationLabel: order.deliveryLocationLabel || "",
    servingStoreName: order.servingStoreName || "",
    batchTotalOrders: Number(order.batchTotalOrders || 0),
    batchTotalEarning: Number(order.batchTotalEarning || 0),
    batchStatus: order.batchStatus || "",
    deliveryBoyStatus: order.deliveryBoyStatus || "",
    deliveryLocation: order.deliveryLocation || "",
    assignedDeliveryName: order.assignedDeliveryName || "",
    assignedDeliveryPhone: order.assignedDeliveryPhone || "",
    assignedDeliveryEmail: order.assignedDeliveryEmail || "",
    collectionMethod: order.collectionMethod || "",
    collectedAmount: Number(order.collectedAmount || 0),
    cashCollectedAmount: Number(order.cashCollectedAmount || 0),
    upiCollectedAmount: Number(order.upiCollectedAmount || 0),
    collectedByDeliveryBoyId: order.collectedByDeliveryBoyId || null,
    collectedAt: order.collectedAt || "",
    deliveryEarningAmount: Number(order.deliveryEarningAmount || 0),
    payoutStatus: order.payoutStatus || "",
    payoutRequestedAt: order.payoutRequestedAt || "",
    payoutReference: order.payoutReference || "",
    payoutPaidAt: order.payoutPaidAt || "",
    createdAt: order.createdAt || new Date().toISOString(),
    assignedAt: order.assignedAt || "",
    pickedAt: order.pickedAt || "",
    deliveredAt: order.deliveredAt || "",
  };
}

function sortOrders(orderList) {
  return [...orderList].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

export function OrderProvider({ children }) {
  const { session } = useAuth();
  const [masterOrders, setMasterOrders] = useState([]);

  const loadOrders = useCallback(async () => {
    if (!session?.role) {
      setMasterOrders([]);
      return [];
    }

    let liveOrders = [];

    if (session.role === "admin") {
      liveOrders = await fetchAdminOrders();
    } else if (session.role === "delivery") {
      liveOrders = await fetchDeliveryOrders();
    } else {
      liveOrders = await fetchMyOrders();
    }

    const normalized = sortOrders(liveOrders.map(normalizeOrder));
    setMasterOrders(normalized);
    return normalized;
  }, [session?.role]);

  useEffect(() => {
    loadOrders().catch(() => {
      setMasterOrders([]);
    });
  }, [loadOrders]);

  const orders = useMemo(() => {
    if (!session) {
      return [];
    }

    if (session.role === "admin" || session.role === "delivery") {
      return masterOrders;
    }

    return masterOrders.filter((order) => order.userId === Number(session.userId || 0));
  }, [masterOrders, session]);

  const refreshOrders = useCallback(async () => loadOrders(), [loadOrders]);

  const placeOrder = useCallback(
    async (payload) => {
      const response = await placeOrderRequest(payload);
      const nextOrder = normalizeOrder({
        ...response,
        userId: Number(session?.userId || 0),
        customerName: session?.name,
        customerEmail: session?.email,
        customerPhone: session?.phone,
        deliveryAddress: payload.deliveryAddress,
        deliveryLatitude: payload.deliveryLatitude,
        deliveryLongitude: payload.deliveryLongitude,
        deliveryLocationLabel: payload.deliveryLocationLabel,
        servingStoreName: payload.servingStoreName,
        deliveryLocation: payload.deliveryLocation,
        paymentMode: payload.paymentMode,
      });

      setMasterOrders((current) => sortOrders([nextOrder, ...current.filter((item) => item.orderNumber !== nextOrder.orderNumber)]));
      return nextOrder;
    },
    [session]
  );

  const confirmOrder = useCallback(async (orderNumber) => {
    const targetOrder = masterOrders.find((order) => order.orderNumber === orderNumber);
    if (!targetOrder?.orderId) {
      throw new Error("Order could not be resolved from backend data.");
    }

    const updatedOrder = normalizeOrder(await updateAdminOrderStatus(targetOrder.orderId, "CONFIRMED"));
    setMasterOrders((current) =>
      sortOrders(current.map((order) => (order.orderNumber === orderNumber ? updatedOrder : order)))
    );
    return updatedOrder;
  }, [masterOrders]);

  const assignDeliveryBoy = useCallback(async (orderNumber, deliveryPartner = DEFAULT_DELIVERY_PARTNER) => {
    const targetOrder = masterOrders.find((order) => order.orderNumber === orderNumber);
    if (!targetOrder?.orderId) {
      throw new Error("Order could not be resolved from backend data.");
    }

    const updatedOrder = normalizeOrder(await assignOrderToDelivery(targetOrder.orderId, deliveryPartner.userId || 3));
    setMasterOrders((current) =>
      sortOrders(current.map((order) => (order.orderNumber === orderNumber ? updatedOrder : order)))
    );
    return updatedOrder;
  }, [masterOrders]);

  const pickOrder = useCallback(async (orderNumber) => {
    const targetOrder = masterOrders.find((order) => order.orderNumber === orderNumber);
    if (!targetOrder?.orderId) {
      throw new Error("Order could not be resolved from backend data.");
    }

    const updatedOrder = normalizeOrder(await acceptDeliveryOrder(targetOrder.orderId));
    setMasterOrders((current) =>
      sortOrders(current.map((order) => (order.orderNumber === orderNumber ? updatedOrder : order)))
    );
    return updatedOrder;
  }, [masterOrders]);

  const deliverOrder = useCallback(async (orderNumber, payload = {}) => {
    const targetOrder = masterOrders.find((order) => order.orderNumber === orderNumber);
    if (!targetOrder?.orderId) {
      throw new Error("Order could not be resolved from backend data.");
    }

    const updatedOrder = normalizeOrder(await markDeliveryOrderCompleted(targetOrder.orderId, payload));
    setMasterOrders((current) =>
      sortOrders(current.map((order) => (order.orderNumber === orderNumber ? updatedOrder : order)))
    );
    return updatedOrder;
  }, [masterOrders]);

  const cancelOrder = useCallback(async (orderNumber) => {
    const targetOrder = masterOrders.find((order) => order.orderNumber === orderNumber);
    if (!targetOrder?.orderNumber) {
      throw new Error("Order could not be resolved from backend data.");
    }

    const updatedOrder = normalizeOrder(await cancelOrderRequest(targetOrder.orderNumber));
    setMasterOrders((current) =>
      sortOrders(current.map((order) => (order.orderNumber === orderNumber ? updatedOrder : order)))
    );
    return updatedOrder;
  }, [masterOrders]);

  const syncOrder = useCallback((nextOrder) => {
    const normalized = normalizeOrder(nextOrder);
    setMasterOrders((current) =>
      sortOrders([normalized, ...current.filter((item) => item.orderNumber !== normalized.orderNumber)])
    );
  }, []);

  const value = useMemo(
    () => ({
      orders,
      allOrders: masterOrders,
      placeOrder,
      refreshOrders,
      confirmOrder,
      assignDeliveryBoy,
      pickOrder,
      deliverOrder,
      cancelOrder,
      syncOrder,
      defaultDeliveryPartner: DEFAULT_DELIVERY_PARTNER,
    }),
    [
      orders,
      masterOrders,
      placeOrder,
      refreshOrders,
      confirmOrder,
      assignDeliveryBoy,
      pickOrder,
      deliverOrder,
      cancelOrder,
      syncOrder,
    ]
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrderContext);

  if (!context) {
    throw new Error("useOrders must be used inside OrderProvider");
  }

  return context;
}
