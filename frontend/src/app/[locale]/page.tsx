import { setRequestLocale } from "next-intl/server";
import { HeroSlideshow } from "@/components/sections/HeroSlideshow";
import { fetchItems } from "@/lib/directus";
import { VacancySummary } from "@/components/sections/VacancySummary";
import { NewsSummary } from "@/components/sections/NewsSummary";
import { InterviewSummary } from "@/components/sections/InterviewSummary";
import type { Vacancy, NewsItem, Interview, NewsCategory } from "@/types";
import { Locale } from "@/lib/directus";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const loc = locale as Locale;

  let vacancies: Vacancy[] = [];
  let newsItems: NewsItem[] = [];
  let categories: NewsCategory[] = [];
  let interviews: Interview[] = [];

  try {
    vacancies = await fetchItems("vacancies", {
      filter: { status: { _eq: "published" } },
      sort: ["-date_posted"],
      limit: 5,
    }) as Vacancy[];
  } catch {
    vacancies = [];
  }

  try {
    categories = await fetchItems("news_categories", {
      limit: 50,
    }) as NewsCategory[];
  } catch {
    categories = [];
  }

  try {
    newsItems = await fetchItems("news", {
      filter: { status: { _eq: "published" } },
      sort: ["-date_published"],
      limit: 6,
    }) as NewsItem[];
  } catch {
    newsItems = [];
  }

  try {
    interviews = await fetchItems("interviews", {
      filter: { status: { _eq: "published" } },
      sort: ["-date_posted"],
      limit: 5,
    }) as Interview[];
  } catch {
    interviews = [];
  }

  return (
    <div className="space-y-12">
      {/* Hero: Slideshow + Welcome */}
      <section className="bg-primary/5 py-10 md:py-16">
        <div className="container-main">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
            {/* Left: Slideshow */}
            <div className="order-1 lg:col-span-3">
              <HeroSlideshow />
            </div>

            {/* Right: Welcome text */}
            <div className="order-2 lg:col-span-2">
              <h1 className="text-xl md:text-2xl font-bold text-primary mb-6">
                {locale === "sw" ? "Ujumbe wa Karibu kutoka kwa Mwenyekiti wa Tume" : "Welcome Message from the Chairman of the Commission"}
              </h1>

              <h2 className="text-2xl font-bold text-primary mb-4">
                {locale === "sw" ? "Karibu" : "Welcome"}
              </h2>
              <p className="text-muted leading-relaxed text-justify">
                {locale === "sw"
                  ? "Karibu kwenye tovuti rasmi ya Tume ya Utumishi Serikalini."
                  : "Welcome to the official website of the Civil Service Commission."}
              </p>
              <p className="text-muted leading-relaxed mt-4 text-justify">
                {locale === "sw"
                  ? "Inanifurahisha sana kuwatakia karibu kwenye jukwaa letu la mtandaoni, ambapo tunatoa taarifa na huduma zinazohusiana na usimamizi na maendeleo ya utumishi wa umma nchini Zanzibar. Kama Tume, tunatambua umuhimu wa kutoa taarifa zinazopatikana kwa urahisi na huduma bora kwa umma na wadau wote. Tovuti hii imeundwa ili kuimarisha mawasiliano, uwazi, na upatikanaji wa taarifa muhimu kuhusu majukumu yetu, huduma, sera, na shughuli zetu."
                  : "It gives me great pleasure to welcome you to our online platform, where we provide information and services related to the management and development of the public service in Zanzibar. As a Commission, we recognize the importance of providing accessible information and quality services to the public and all stakeholders. This website has therefore been developed to enhance communication, transparency, and access to important information regarding our functions, services, policies, and activities."}
              </p>
              <p className="text-muted leading-relaxed mt-4 text-justify">
                {locale === "sw"
                  ? "Asante kwa kutembelea tovuti yetu. Tunakuhimiza kuchunguza taarifa zilizotolewa na kuwasiliana nami inapobidi."
                  : "Thank you for visiting our website. We encourage you to explore the information provided and engage with us whenever necessary."}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 mt-6">
                <a
                  href={`/${locale}/vacancies`}
                  className="px-5 py-2.5 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors font-medium no-underline text-sm"
                >
                  {locale === "sw" ? "Nafasi za Kazi" : "Vacancies"}
                </a>
                <a
                  href={`/${locale}/interviews`}
                  className="px-5 py-2.5 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-white transition-colors font-medium no-underline text-sm"
                >
                  {locale === "sw" ? "Mwaliko wa Usaili" : "Interviews"}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest News Summary */}
      <NewsSummary items={newsItems} categories={categories} locale={loc} />

      {/* Vacancy Summary */}
      <VacancySummary items={vacancies} locale={loc} />

      {/* Interview Summary */}
      <InterviewSummary items={interviews} locale={loc} />
    </div>
  );
}