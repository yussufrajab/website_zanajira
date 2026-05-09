import { setRequestLocale, getTranslations } from "next-intl/server";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ContactForm } from "@/components/ui/ContactForm";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ContactUsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();

  return (
    <div className="container-main py-8">
      <Breadcrumb items={[{ label: t("nav.contact_us") }]} />
      <h1 className="text-3xl font-bold text-primary mb-8">
        {t("contact.title")}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Information */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {locale === "sw" ? "Maelezo ya Mawasiliano" : "Contact Information"}
          </h2>

          {/* Unguja Office */}
          <div className="bg-white rounded-lg border border-border shadow-sm p-5 mb-4">
            <h3 className="font-semibold text-primary mb-3">
              {locale === "sw" ? "Ofisi Kuu - Unguja" : "Head Office — Unguja"}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-sm">{t("contact.address")}</div>
                  <div className="text-muted text-sm">S.L.P 1587 — Zanzibar Road Fund (ZRF), Gymkhana Street, Zanzibar</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-sm">{t("contact.phone")}</div>
                  <div className="text-muted text-sm">+255 773 101012</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-sm">{t("contact.email")}</div>
                  <div className="text-muted text-sm">info@zanajira.go.tz</div>
                </div>
              </div>
            </div>
          </div>

          {/* Pemba Office */}
          <div className="bg-white rounded-lg border border-border shadow-sm p-5 mb-4">
            <h3 className="font-semibold text-primary mb-3">
              {locale === "sw" ? "Ofisi Kuu - Pemba" : "Head Office — Pemba"}
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-sm">{t("contact.address")}</div>
                  <div className="text-muted text-sm">S.L.P 1587 — Gombani, Chake Chake, Pemba</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-sm">{t("contact.phone")}</div>
                  <div className="text-muted text-sm">+255 773 101012</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center text-primary flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-sm">{t("contact.email")}</div>
                  <div className="text-muted text-sm">info.pba@zanajira.go.tz</div>
                </div>
              </div>
            </div>
          </div>

          {/* Office Hours */}
          <div className="flex items-start gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center text-primary flex-shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <div className="font-semibold">{t("contact.office_hours")}</div>
              <div className="text-muted">
                {locale === "sw"
                  ? "Jumatatu - Ijumaa: 07:30 - 15:30"
                  : "Monday - Friday: 07:30 - 15:30"}
              </div>
            </div>
          </div>

          {/* Parent Office */}
          <div className="bg-surface rounded-lg border border-border p-4 mb-6">
            <p className="text-sm text-muted font-medium">
              {locale === "sw"
                ? "OFISI YA RAIS - KATIBA, SHERIA, UTUMISHI WA UMMA NA UTAWALA BORA"
                : "PRESIDENT'S OFFICE — CONSTITUTION, LEGAL AFFAIRS, PUBLIC SERVICE AND GOOD GOVERNANCE"}
            </p>
          </div>

        </div>

        {/* Contact Form */}
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {t("contact.form_title")}
          </h2>
          <ContactForm />
        </div>
      </div>

      {/* Map */}
      <h2 className="text-xl font-semibold mb-4 mt-8">
        {locale === "sw" ? "Ramani" : "Our Location"}
      </h2>
      <div className="rounded-lg overflow-hidden border border-border" style={{ height: "500px" }}>
        <iframe
          title={locale === "sw" ? "Ramani ya Tume ya Utumishi Serikalini" : "Civil Services Commission map"}
          src="https://www.openstreetmap.org/export/embed.html?bbox=39.1813%2C-6.1874%2C39.2113%2C-6.1574&amp;layer=mapnik&amp;marker=-6.172499%2C39.196325"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}