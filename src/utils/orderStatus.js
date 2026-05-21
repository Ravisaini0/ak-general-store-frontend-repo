export const orderStatuses = [
  "ORDER_PLACED",
  "ADMIN_CONFIRMED",
  "ASSIGNED_TO_DELIVERY",
  "PICKED_BY_DELIVERY",
  "ORDER_COMPLETED",
  "ORDER_CANCELLED",
];

export const orderStatusLabels = {
  ORDER_PLACED: "Order Placed",
  ADMIN_CONFIRMED: "Confirmed by Admin",
  ASSIGNED_TO_DELIVERY: "Assigned to Delivery Partner",
  PICKED_BY_DELIVERY: "Picked Up by Delivery Partner",
  ORDER_COMPLETED: "Order Completed",
  ORDER_CANCELLED: "Order Cancelled",
};

export function getOrderStatusLabel(status) {
  return orderStatusLabels[status] || status || "Pending";
}

function formatTimelineTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getOrderProgressSteps(order) {
  const assignedName = order?.assignedDeliveryName || "Delivery Partner";
  if (order?.status === "ORDER_CANCELLED") {
    return [
      {
        key: "ORDER_PLACED",
        label: "Order placed successfully",
        description: "Your order was created and shared with the store team.",
        timestamp: formatTimelineTime(order?.createdAt),
        done: true,
        current: false,
      },
      {
        key: "ORDER_CANCELLED",
        label: "Order cancelled",
        description: "This order was cancelled before dispatch and will not move further in fulfilment.",
        timestamp: formatTimelineTime(order?.cancelledAt || order?.updatedAt || order?.createdAt),
        done: true,
        current: true,
      },
    ];
  }

  const statusIndex = orderStatuses.indexOf(order?.status || "ORDER_PLACED");

  return [
    {
      key: "ORDER_PLACED",
      label: "Order placed successfully",
      description: "Your order has been created and shared with the store team for confirmation.",
      timestamp: formatTimelineTime(order?.createdAt),
      done: statusIndex >= 0,
      current: statusIndex === 0,
    },
    {
      key: "ADMIN_CONFIRMED",
      label: "Store confirmed your order",
      description: "The store has reviewed your cart, accepted the request, and started processing it.",
      timestamp: formatTimelineTime(order?.confirmedAt || order?.assignedAt || order?.createdAt),
      done: statusIndex >= 1,
      current: statusIndex === 1,
    },
    {
      key: "ASSIGNED_TO_DELIVERY",
      label: `${assignedName} assigned for delivery`,
      description: "A delivery partner has been assigned and is preparing to pick up your package.",
      timestamp: formatTimelineTime(order?.assignedAt),
      done: statusIndex >= 2,
      current: statusIndex === 2,
    },
    {
      key: "PICKED_BY_DELIVERY",
      label: "Order picked and out for delivery",
      description: "Your order has left the store and is on the way to your delivery address.",
      timestamp: formatTimelineTime(order?.pickedAt),
      done: statusIndex >= 3,
      current: statusIndex === 3,
    },
    {
      key: "ORDER_COMPLETED",
      label: "Delivery completed",
      description: "The order has been delivered successfully. We hope you enjoy your groceries.",
      timestamp: formatTimelineTime(order?.deliveredAt),
      done: statusIndex >= 4,
      current: statusIndex === 4,
    },
  ];
}
