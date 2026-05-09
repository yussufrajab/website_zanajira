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
    body_sw: `
<h2>Dira</h2>
<p>Kuwepo kwa utumishi uliotukuka ambao utazingatia watumishi wenye sifa, nidhamu na maadili katika utumishi wa serikali kuu.</p>

<h2>Dhamira</h2>
<p>Kushughulikia haki za watumishi, mashauri ya kinidhamu na taratibu za uajiri ndani ya muda unaotakiwa kwa lengo la kuimarisha utendaji serikalini.</p>

<h2>Maadili ya Tume</h2>
<p>Katika utekelezaji wa majukumu yake tume itasimamia maadili ya msingi kama ifuatavyo: -</p>
<ol>
<li>Kutoa huduma kwa uwazi, uwajibikaji bila ya upendeleo.</li>
<li>Kujali maslahi ya wafanyakazi wote na wataka huduma wetu.</li>
<li>Kuzingatia matumizi bora ya rasilimali za serikali.</li>
<li>Kutoa huduma kwa uadilifu na uaminifu.</li>
<li>Kujiheshimu na kuheshimiana, kushirikiana na watoa huduma wengine katika kutoa huduma.</li>
<li>Kutii sheria, uadilifu, na utii kwa serikali.</li>
<li>Kutoa huduma kwa ukarimu na kumjalii mtaka huduma.</li>
<li>Kusimamia matumizi bora ya taarifa za kiofisi.</li>
<li>Kusimamia heshima, nidhamu kwa watumishi na wataka huduma.</li>
<li>Kusimamia maadili ya kazi, usiri na faragha kwa wataka huduma.</li>
</ol>`,
    body_en: `
<h2>Vision</h2>
<p>A distinguished public service that upholds employees of integrity, discipline, and ethics within the central government service.</p>

<h2>Mission</h2>
<p>To oversee employees' rights, provide disciplined counsel, and manage recruitment processes within the required timeframe, with the aim of strengthening government performance.</p>

<h2>Commission Core Values</h2>
<p>In fulfilling its mandate, the Commission shall uphold the following core values:</p>
<ol>
<li>Providing services with transparency and accountability, free from favoritism.</li>
<li>Considering the interests of all employees and service seekers.</li>
<li>Ensuring prudent use of government resources.</li>
<li>Delivering services with integrity and trustworthiness.</li>
<li>Maintaining mutual respect and collaboration with other service providers.</li>
<li>Upholding the rule of law, integrity, and obedience to the government.</li>
<li>Providing services with courtesy and attentiveness to service seekers.</li>
<li>Safeguarding the proper use of official information.</li>
<li>Upholding respect and discipline toward employees and service seekers.</li>
<li>Maintaining professional ethics, confidentiality, and privacy for service seekers.</li>
</ol>`,
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
      <article className="prose prose-lg max-w-none [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-primary [&_h2]:mb-4 [&_h2]:mt-10 [&_ol]:list-decimal [&_ol]:pl-8 [&_ol_li]:mb-3 [&_ol_li]:text-base [&_ol_li]:marker:text-primary [&_ol_li]:marker:font-bold">
        <h1 className="text-3xl font-bold text-primary mb-6">{title}</h1>
        <div dangerouslySetInnerHTML={{ __html: body }} />
      </article>
    </div>
  );
}