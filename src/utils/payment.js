export function buildUpiPaymentLink({
  upiId,
  merchantName,
  amount,
  note,
}) {
  const params = new URLSearchParams();
  params.set("pa", upiId || "");
  params.set("pn", merchantName || "AK General Store");
  params.set("am", Number(amount || 0).toFixed(2));
  params.set("cu", "INR");
  params.set("tn", note || "AK General Store Payment");
  return `upi://pay?${params.toString()}`;
}

export function buildQrPreviewUrl(payload) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(payload)}`;
}
