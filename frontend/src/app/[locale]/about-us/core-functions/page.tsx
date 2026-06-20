import { setRequestLocale, getTranslations } from "next-intl/server";
import { getLocalizedField, Locale } from "@/lib/locale";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CoreFunctionsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const loc = locale as Locale;

  const page = {
    title_sw: "Kazi Msingi",
    title_en: "Core Functions",
    body_sw: `<p>Kazi msingi za Tume ya Utumishi Serikalini ni pamoja na:</p>

<h3>1. Uteuzi wa Watumishi</h3>
<p>Tume ya Utumishi wa Umma inawajibika kuteua watu kushika nafasi za umma kwa msingi wa sifa na stahiki.</p>

<h3>2. Kumaliza Utumishi</h3>
<p>Kumaliza utumishi wao wa kazi.</p>

<h3>3. Mapendekezo ya Mshahara</h3>
<p>Kupendeza kwa Serikali mishahara na manufaa ya wafanyakazi wao.</p>

<h3>4. Mpango wa Utumishi</h3>
<p>Kupendeza kwa Tume uidhinishaji wa mpango wa utumishi wa taasisi.</p>

<h3>5. Kuendeleza</h3>
<p>Kuidhinisha kuendeleza wafanyakazi.</p>

<h3>6. Kanuni na Mwenendo</h3>
<p>Kuhakikisha kanuni za msingi za umma, thamani, na kanuni za mwenendo zinazingatiwa.</p>

<h3>7. Kuongeza Muda wa Utumishi</h3>
<p>Kuidhinisha kuongeza muda wa utumishi hadi miaka miwili na kupendeza kwa Katibu Mkuu kuongeza muda wowote wa utumishi unaozidi miaka miwili.</p>

<h2>Thamani za Msingi</h2>

<h3>Uwazi</h3>
<p>Kuhakikisha uwazi katika kutangaza nafasi za kazi na katika uteuzi ili wananchi wapate fursa za ajiri za uaminifu.</p>

<h3>Uadilifu</h3>
<p>Kuhakikisha ajiri zinazotangazwa zinatolewa bila upendeleo kwa wananchi.</p>

<h3>Kutoridhika na Rushwa</h3>
<p>Kuhakikisha wafanyakazi wa Tume wanabaki huru na rushwa ili wananchi wapate ajiri salama.</p>

<h3>Usawa</h3>
<p>Kuhakikisha usawa wa ajiri kwa wote, ikiwa ni pamoja na wanaume na wanawake.</p>`,
    body_en: `<p>The core functions of the Civil Service Commission include:</p>

<h3>1. Recruitment</h3>
<p>The Public Service Commission is responsible for recruiting people to hold public office based on merit and qualifications.</p>

<h3>2. Termination</h3>
<p>To terminate their employment.</p>

<h3>3. Compensation Recommendations</h3>
<p>Recommend to the Government the salaries and benefits of their employees.</p>

<h3>4. Scheme of Service</h3>
<p>To recommend to the Commission the approval of the scheme of service of the institution.</p>

<h3>5. Promotions</h3>
<p>To approve the promotion.</p>

<h3>6. Principles and Conduct</h3>
<p>To ensure the public basic principles, values, and code of conduct are observed.</p>

<h3>7. Service Extensions</h3>
<p>To approve extended service up to two years and to recommend to the Chief Secretary any extended service exceeding two years.</p>

<h2>Core Values</h2>

<h3>Transparency</h3>
<p>Ensures openness in advertising vacancies and in recruitment so citizens receive honest employment opportunities.</p>

<h3>Integrity</h3>
<p>Ensures advertised jobs are offered without bias to citizens.</p>

<h3>Corruption Free</h3>
<p>Ensures commission staff remain free from corruption so citizens can obtain secure employment.</p>

<h3>Equality</h3>
<p>Ensures employment equity for all, including both men and women.</p>`,
  };

  const title = getLocalizedField(page, "title", loc);
  const body = getLocalizedField(page, "body", loc);

  return (
    <div className="container-main py-8">
      <Breadcrumb
        items={[
          { label: t("nav.about_us"), href: "/about-us" },
          { label: t("nav.core_functions") },
        ]}
      />
      <article className="prose prose-lg max-w-none [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-primary [&_h2]:mb-4 [&_h2]:mt-10 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-primary">
        <h1 className="text-3xl font-bold text-primary mb-6">{title}</h1>
        <div dangerouslySetInnerHTML={{ __html: body }} />
      </article>
    </div>
  );
}