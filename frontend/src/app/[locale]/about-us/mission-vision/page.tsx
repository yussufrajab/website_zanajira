import { setRequestLocale, getTranslations } from "next-intl/server";
import { getLocalizedField, Locale } from "@/lib/directus";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function MissionVisionPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const loc = locale as Locale;

  const page = {
    title_sw: "Dira na Dhamira",
    title_en: "Mission & Vision",
    body_sw: `<h2>Dira</h2>
<p>Kuwepo kwa utumishi wa ujitolea unaokidhi thamani na sifa za watumishi wa serikali.</p>

<h2>Dhamira</h2>
<p>Kushughulikia haki za wafanyakazi na kutoa fursa za kuendeleza utendaji wa serikali.</p>

<h2>Thamani za Msingi</h2>
<ul>
<li><strong>Uwazi:</strong> Kuhakikisha uwazi katika kutangaza nafasi za kazi na katika uteuzi ili wananchi wapate fursa za ajiri za uaminifu.</li>
<li><strong>Uadilifu:</strong> Kuhakikisha ajiri zinazotangazwa zinatolewa bila upendeleo kwa wananchi.</li>
<li><strong>Kutoridhika na Rushwa:</strong> Kuhakikisha wafanyakazi wa Tume wanabaki huru na rushwa ili wananchi wapate ajiri salama.</li>
<li><strong>Usawa:</strong> Kuhakikisha usawa wa ajiri kwa wote, ikiwa ni pamoja na wanaume na wanawake.</li>
</ul>`,
    body_en: `<h2>Vision</h2>
<p>The existence of dedicated service that meets the values and qualities of the civil servants.</p>

<h2>Mission</h2>
<p>Addressing the rights of employees and provide opportunities to promote government performance.</p>

<h2>Core Values</h2>
<ul>
<li><strong>Transparency:</strong> Ensures openness in advertising vacancies and in recruitment so citizens receive honest employment opportunities.</li>
<li><strong>Integrity:</strong> Ensures advertised jobs are offered without bias to citizens.</li>
<li><strong>Corruption Free:</strong> Ensures commission staff remain free from corruption so citizens can obtain secure employment.</li>
<li><strong>Equality:</strong> Ensures employment equity for all, including both men and women.</li>
</ul>`,
  };

  const title = getLocalizedField(page, "title", loc);
  const body = getLocalizedField(page, "body", loc);

  return (
    <div className="container-main py-8">
      <Breadcrumb
        items={[
          { label: t("nav.about_us"), href: "/about-us" },
          { label: t("nav.mission_vision") },
        ]}
      />
      <article className="prose prose-lg max-w-none [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-primary [&_h2]:mb-4 [&_h2]:mt-10">
        <h1 className="text-3xl font-bold text-primary mb-6">{title}</h1>
        <div dangerouslySetInnerHTML={{ __html: body }} />
      </article>
    </div>
  );
}