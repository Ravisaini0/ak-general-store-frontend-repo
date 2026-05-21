import BackButton from "../../components/common/BackButton";
import Footer from "../../components/common/Footer";
import Header from "../../components/common/Header";
import TopBar from "../../components/common/TopBar";

const sections = [
  {
    title: "Information We Collect",
    text: "We collect account details such as name, email, phone number, delivery address, order details, and account activity required to process orders and support delivery operations.",
  },
  {
    title: "How We Use Information",
    text: "Customer information is used for order processing, OTP verification, customer support, delivery coordination, payment confirmation, and service-area validation.",
  },
  {
    title: "Payments & Security",
    text: "Sensitive payment verification is handled through backend-secured flows. Card details should never be stored directly by the website, and live payment handling must use a certified payment provider.",
  },
  {
    title: "Sharing & Access",
    text: "Information is shared only where needed for fulfilment, delivery, customer support, or legally required processing. Delivery partners receive only the information required to complete a delivery.",
  },
  {
    title: "Retention & Updates",
    text: "Order, delivery, and account records may be retained for service operations, reporting, and compliance. Customers should contact support for account-related updates or privacy concerns.",
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="page-shell">
      <TopBar />
      <Header />
      <main className="store-shell py-6">
        <BackButton fallback="/" className="mb-5" />
        <section className="soft-panel max-w-4xl p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">Privacy Policy</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">How customer data is handled on AK General Store</h1>
          <p className="mt-5 text-sm leading-7 text-slate-600 sm:text-base">
            This policy explains how account, delivery, and order information is collected and
            used when customers browse, login, place orders, or request support through AK General Store.
          </p>

          <div className="mt-8 space-y-4">
            {sections.map((section) => (
              <div key={section.title} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-5">
                <h2 className="text-lg font-black text-slate-950">{section.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{section.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
