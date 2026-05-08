import { setRequestLocale, getTranslations } from "next-intl/server";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function OurServicePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();

  const services = [
    {
      name_sw: "Kusimamia, kufuatilia, na kutathimini mchakato wa uteuzi wa Serikali ya Kati",
      name_en: "Administer, monitor and evaluate the Central Government recruitment process",
      desc_sw: "Tume husimamia mchakato wa uteuzi wa wafanyakazi wa serikali kwa kuhakikisha uwazi, uadilifu, na kufuata sheria na kanuni zinazohusika.",
      desc_en: "The Commission oversees the recruitment process of government employees by ensuring transparency, integrity, and compliance with relevant laws and regulations.",
    },
    {
      name_sw: "Kuidhinisha ajira za Mikataba ya Kipekee",
      name_en: "Approving the Employment of Special Contracts",
      desc_sw: "Tume inaidhinisha ajiri za mikataba ya kipekee baada ya kupata idhini kutoka Katibu wa Baraza la Mapinduzi na Katibu Mkuu.",
      desc_en: "The Commission approves employment of special contracts after obtaining approval from the Secretary of the Revolutionary Council and the Chief Secretary.",
    },
    {
      name_sw: "Kuidhinisha kuongeza muda wa utumishi kwa wafanyakazi",
      name_en: "Approving extension of service for Employees",
      desc_sw: "Tume inaidhinisha kuongeza muda wa utumishi hadi miaka miwili na kupendeza kuongeza zaidi ya miaka miwili kwa Katibu Mkuu.",
      desc_en: "The Commission approves extended service up to two years and recommends to the Chief Secretary any extended service exceeding two years.",
    },
    {
      name_sw: "Kupokea, kusikiliza, na kuchambua malalamiko na rufaa za wafanyakazi",
      name_en: "Receiving, listening, and analyzing all employee complaints and appeals",
      desc_sw: "Tume inapokea na kusikiliza malalamiko na rufaa za wafanyakazi wa serikali na kuyachambua kwa kufuata taratibu za kisheria.",
      desc_en: "The Commission receives, listens to, and analyzes employee complaints and appeals submitted by civil servants following legal procedures.",
    },
    {
      name_sw: "Uthibitishaji wa utumishi baada ya kipindi cha majaribio",
      name_en: "Confirmation of service for employees after completing the probation period",
      desc_sw: "Tume inathibitisha utumishi wa wafanyakazi baada ya kumaliza kipindi cha majaribio, kuhakikisha wanafikia vigezo vinavyohitajika.",
      desc_en: "The Commission confirms the service of employees after completing the probation period, ensuring they meet the required standards.",
    },
    {
      name_sw: "Kufuta au kurudisha wafanyakazi wanaoshukiwa kufanya makosa ya nidhamu",
      name_en: "Dismissal or reinstatement of employees suspected of disciplinary offences",
      desc_sw: "Tume inashughulikia masuala ya nidhamu ya wafanyakazi, ikiwemo kufuta au kurudisha wale wanaoshukiwa kufanya makosa ya nidhamu.",
      desc_en: "The Commission handles disciplinary matters for employees, including dismissal or reinstatement of those suspected of committing disciplinary offences.",
    },
    {
      name_sw: "Kukuza wafanyakazi kulingana na Mpango wa Utumishi",
      name_en: "Promotion of employees in accordance with the Scheme of Service",
      desc_sw: "Tume inasimamia na kupendeza kuendeleza wafanyakazi kulingana na Mpango wa Utumishi wa taasisi husika.",
      desc_en: "The Commission oversees and recommends the promotion of employees in accordance with the Scheme of Service of the respective institution.",
    },
    {
      name_sw: "Kutoa likizo bila malipo kwa watumishi wa serikali",
      name_en: "Issue leave without pay for civil servants",
      desc_sw: "Tume inazingatia na kupendeza likizo bila malipo kwa watumishi wa serikali kulingana na sheria na kanuni zinazohusika.",
      desc_en: "The Commission considers and recommends leave without pay for civil servants in accordance with relevant laws and regulations.",
    },
    {
      name_sw: "Kumaliza utumishi",
      name_en: "Termination of service",
      desc_sw: "Tume inapendeza kumaliza utumishi kwa wafanyakazi wanaostaafu kwa hiari, wanaostaafu kwa lazima, na wale wanaopendeza na Baraza la Daktari.",
      desc_en: "The Commission recommends termination of service for voluntary retirement, compulsory retirement, and Medical Board recommendations.",
    },
    {
      name_sw: "Kuandaa na kutoa mabaraza kuhusu shughuli za Tume",
      name_en: "Prepare and issue circulars pertaining to Commission's activities",
      desc_sw: "Tume inaandaa na kutoa mabaraza yanayohusiana na shughuli na majukumu ya Tume.",
      desc_en: "The Commission prepares and issues circulars related to the Commission's activities and responsibilities.",
    },
    {
      name_sw: "Kubadilisha kadhi kwa wafanyakazi",
      name_en: "Changing of cadre for employees",
      desc_sw: "Tume inaratibu na kupendeza mabadiliko ya kadhi kwa wafanyakazi kulingana na mahitaji ya utumishi.",
      desc_en: "The Commission coordinates and recommends changes of cadre for employees according to service requirements.",
    },
  ];

  return (
    <div className="container-main py-8">
      <Breadcrumb items={[{ label: t("nav.our_service") }]} />
      <h1 className="text-3xl font-bold text-primary mb-8">
        {t("services.title")}
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-border shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-3 mb-3">
              <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <h2 className="text-lg font-semibold text-primary">
                {locale === "sw" ? service.name_sw : service.name_en}
              </h2>
            </div>
            <p className="text-muted leading-relaxed">
              {locale === "sw" ? service.desc_sw : service.desc_en}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}