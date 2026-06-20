import { setRequestLocale, getTranslations } from "next-intl/server";
import { getLocalizedField, Locale } from "@/lib/locale";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function IntroductionPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const loc = locale as Locale;

  const page = {
    title_sw: "Utangulizi",
    title_en: "Introduction",
    body_sw: `<p>Tume ya Utumishi Serikalini ni taasisi huru iliyoanzishwa na Serikali kwa mujibu wa Katiba ya Zanzibar ya 1984 chini ya Kifungu cha 117, 2010 na Kifungu cha 33 (1) cha Sheria ya Utumishi wa Umma Na. 2 ya 2011. Tume inawajibika kwa ujumla kwa kusimamia watumishi wa Serikali kwa uadilifu na kufuata kanuni za Utawala Bora na kusimamia mchakato wa uteuzi.</p>

<h2>Historia</h2>
<p>Tume ya Utumishi Serikalini ni taasisi huru tangu kuanzishwa kwake mwaka 1986 chini ya Sheria ya Tume ya Utumishi Serikalini Na. 14 ya 1986 na Katiba ya Zanzibar ya 1984.</p>
<p>Kwa mujibu wa Kifungu cha 3 (1) cha Sheria ya Tume ya Utumishi Serikalini Na. 14 ya 1986, Tume ilijumuisha Mwenyekiti, Naibu Mwenyekiti, na Wanachama watano wote waliochaguliwa na Mheshimiwa Rais wa Zanzibar na Mwenyekiti wa Baraza la Mapinduzi.</p>
<p>Tume kwa wakati huo ilikuwa ikifanya majukumu yake kama ilivyoelezwa katika Sheria ya Tume ya Utumishi Serikalini Na. 14 ya 1986 na ilikuwa na jukumu la kusimamia watumishi wa Serikali. Miongoni mwa majukumu yake ilikuwa ni kusimamia nidhamu ya watumishi, uthibitishaji wa watumishi, kuongeza muda wa utumishi, ustaafu, kuendelea, na shughuli nyingine zinazohusiana.</p>`,
    body_en: `<p>The Civil Service Commission is an independent institution established by the Government in accordance with the Zanzibar Constitution of 1984 under Section 117, 2010 and Article 33 (1) of the Public Service Act No. 2 of 2011. The Commission is generally responsible for managing Civil Servants with integrity and compliance with the principles of Good Governance and to oversee the recruitment process.</p>

<h2>Background</h2>
<p>The Civil Service Commission is an independent institution since its inception in 1986 under the Civil Service Commission Act No. 14 of 1986 and the Zanzibar Constitution of 1984.</p>
<p>In accordance with Section 3 (1) of the Civil Service Commission Act No. 14 of 1986, the Commission consisted of the Chairman, Vice Chairman and five Members who were appointed by Mr. President of Zanzibar and the Chairman of the Council of the Revolution.</p>
<p>The Commission for that time was performing its obligations as stipulated in Civil Service Commission Act No. 14 of 1986 and was responsible for overseeing civil Servants. Among its duties were managing servant's disciplines, confirmation of servants, increasing service time, retirement, promotion etc.</p>`,
  };

  const title = getLocalizedField(page, "title", loc);
  const body = getLocalizedField(page, "body", loc);

  return (
    <div className="container-main py-8">
      <Breadcrumb
        items={[
          { label: t("nav.about_us"), href: "/about-us" },
          { label: t("nav.introduction") },
        ]}
      />
      <article className="prose prose-lg max-w-none [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-primary [&_h2]:mb-6 [&_h2]:mt-10">
        <h1 className="text-3xl font-bold text-primary mb-6">{title}</h1>
        <div dangerouslySetInnerHTML={{ __html: body }} />
      </article>
    </div>
  );
}