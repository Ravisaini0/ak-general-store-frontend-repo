import BackButton from "../../components/common/BackButton";
import Footer from "../../components/common/Footer";
import Header from "../../components/common/Header";
import TopBar from "../../components/common/TopBar";

export default function AboutUs() {
  return (
    <div className="page-shell">
      <TopBar />
      <Header />
      <main className="store-shell py-6">
        <BackButton fallback="/" className="mb-5" />
        <section className="soft-panel max-w-5xl p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-500">About Us</p>
          <h1 className="mt-3 text-3xl font-black text-slate-950 sm:text-4xl">Trusted local grocery delivery for everyday essentials</h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
            AK General Store is built to make daily grocery ordering simple, reliable, and fast.
            We focus on household essentials, pantry staples, fresh flour service, and an easy
            checkout experience backed by customer support, delivery tracking, and clear policies.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Reliable Storefront",
                text: "Clean browsing, search, cart, checkout, and order tracking designed for real customer use.",
              },
              {
                title: "Secure Ordering",
                text: "Authentication, OTP verification, protected checkout, and backend payment verification flow.",
              },
              {
                title: "Local Fulfilment",
                text: "Coverage-based delivery, route-aware order handling, and dedicated delivery operations.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-[1.4rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-lg font-black text-slate-950">{item.title}</p>
                <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-[1.4rem] border border-slate-200 bg-white p-5">
              <h2 className="text-xl font-black text-slate-950">Contact & Support</h2>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p><span className="font-bold text-slate-900">Phone:</span> 9483989109</p>
                <p><span className="font-bold text-slate-900">WhatsApp:</span> 9483989109</p>
                <p><span className="font-bold text-slate-900">Email:</span> support@akgeneralstore.com</p>
                <p><span className="font-bold text-slate-900">Hours:</span> 24/7 assistance for orders, support, and store enquiries</p>
              </div>
            </div>
            <div className="rounded-[1.4rem] border border-slate-200 bg-white p-5">
              <h2 className="text-xl font-black text-slate-950">Store Address</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Main branch location is available on Google Maps for store visits, navigation,
                delivery coordination, and service-area verification.
              </p>
              <a
                href="https://maps.app.goo.gl/YY4f8NfB9sTfRQrH7"
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white"
              >
                Open Store Location
              </a>
            </div>
          </div>

          <div className="mt-8 rounded-[1.4rem] border border-emerald-200 bg-emerald-50 p-5">
            <h2 className="text-xl font-black text-slate-950">SSL & Website Trust</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Orders, account sessions, and payment flows are designed for secure live deployment.
              On production hosting, the website should be served over HTTPS with a valid SSL
              certificate so customers see a secure connection before checkout.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
