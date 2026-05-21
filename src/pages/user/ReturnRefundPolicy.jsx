import BackButton from "../../components/common/BackButton";
import Footer from "../../components/common/Footer";
import Header from "../../components/common/Header";
import TopBar from "../../components/common/TopBar";

const policyBlocks = [
  {
    title: "Order Return Requests",
    text: "Return requests should be raised promptly for damaged, incorrect, or unusable items. Return approval depends on item condition, order verification, and store policy.",
  },
  {
    title: "Refund Eligibility",
    text: "Refunds may be considered for cancelled prepaid orders, verified fulfilment issues, or approved return cases. Refund timelines depend on payment method and provider processing.",
  },
  {
    title: "Non-Returnable Cases",
    text: "Perishable or opened items may not be eligible for return unless the issue is verified at delivery or reported immediately with valid order details.",
  },
  {
    title: "COD & UPI Resolution",
    text: "Cash on Delivery and manual UPI collection issues should be reported with order number, payment detail, and customer contact information for resolution.",
  },
];

export default function ReturnRefundPolicy() {
  return (
    <div className="page-shell">
      <TopBar />
      <Header />
      <main className="store-shell py-6">
        <BackButton fallback="/" className="mb-5" />
        <section className="soft-panel max-w-4xl p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">Return / Refund Policy</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">Clear policy for returns, refund review, and order disputes</h1>
          <div className="mt-8 grid gap-4">
            {policyBlocks.map((item) => (
              <div key={item.title} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-lg font-black text-slate-950">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
