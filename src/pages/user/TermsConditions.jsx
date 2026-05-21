import BackButton from "../../components/common/BackButton";
import Footer from "../../components/common/Footer";
import Header from "../../components/common/Header";
import TopBar from "../../components/common/TopBar";

const terms = [
  "Customers must provide accurate account, contact, and delivery details while ordering.",
  "Orders are accepted subject to service-area availability, stock availability, and operational review.",
  "Prices, delivery charges, and offer eligibility may change based on availability, location, or active campaign rules.",
  "The store may cancel or reject suspicious, duplicate, fraudulent, or out-of-coverage orders.",
  "OTP verification and account security steps are required for protected customer actions.",
  "Admin, delivery, and operations flows are platform-controlled and may affect delivery timelines, assignment, and payout handling.",
];

export default function TermsConditions() {
  return (
    <div className="page-shell">
      <TopBar />
      <Header />
      <main className="store-shell py-6">
        <BackButton fallback="/" className="mb-5" />
        <section className="soft-panel max-w-4xl p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">Terms & Conditions</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">Rules for ordering, account access, and platform usage</h1>
          <div className="mt-8 grid gap-4">
            {terms.map((term) => (
              <div key={term} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                {term}
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
