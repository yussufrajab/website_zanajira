import { setRequestLocale, getTranslations } from "next-intl/server";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DepartmentPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();

  const departments = [
    {
      name_sw: "Idara ya Rasilimali Watu, Utawala na Mipango",
      name_en: "Department of Human Resources, Administration and Planning",
      responsibilities_sw: [
        "Kutoa huduma za utawala na uendeshaji kwa Tume",
        "Kushughulikia masuala ya rasilimali watu, ikiwemo mafunzo, mikataba ya utendaji, mikataba ya huduma, mishahara, na haki za wafanyakazi",
        "Kuratibu uandaa, utekelezwaji, ufuatiliaji, na tathmini ya mpango wa kazi wa Tume",
        "Kutoa mwongozo na utaalamu wakati wa upangaji, utekelezwaji wa viashiria (Key Performance Indicators) na taarifa za utekelezwaji wa majukumu ya Tume",
        "Kuandaa na kusimamia mfumo wa kukusanya taarifa na kuzalisha ripoti za utekelezwaji wa Tume",
        "Kukusanya, kuchambua, na kutambua masuala ya kujumuishwa katika takwimu za Tume",
        "Kuendeleza mfumo wa ufuatiliaji wa taarifa na kutoa ushauri wa kitaalamu wa utekelezwaji",
        "Kusimamia na kutathmini utekelezwaji wa miradi, programu, na programu za maendeleo",
        "Kuandaa ripoti za robo, nusu mwaka, na mwaka za utekelezwaji zinazowasilishwa kwa Katibu wa Tume",
        "Kufanya majukumu mengine kama alivyoagizwa na Katibu wa Tume",
      ],
      responsibilities_en: [
        "Provides administration and operational services for the Commission",
        "Handles HR matters including training, performance contracts, service delivery contracts, salaries, and personnel entitlements",
        "Coordinates preparation, implementation, monitoring, and evaluation of the Commission's work plan",
        "Provides guidance and expertise during planning, implementation of Key Performance Indicators and information on Commission functions",
        "Prepares and administers a system for collecting information and generating the Commission's implementation reports",
        "Collects, analyzes, and identifies issues to be included in the Commission's statistics",
        "Develops a monitoring system for information and provides expert implementation advice",
        "Manages and assesses implementation of projects, programs, and development programs",
        "Prepares quarterly, half-yearly, and annual implementation reports submitted to the Commission Secretary",
        "Carries out other duties as assigned by the Commission Secretary",
      ],
    },
    {
      name_sw: "Idara ya Usimamizi wa Rasilimali Watu",
      name_en: "Department of Human Resource Management",
      responsibilities_sw: [
        "Kuratibu, kushauri, na kupendeza kuongeza muda wa utumishi kwa wafanyakazi wanaofikia umri wa kustaafu kwa lazima",
        "Kupokea, kusikiliza, na kuchambua malalamiko na rufaa za wafanyakazi zinazowasilishwa kwa Tume",
        "Kuandaa na kupendeza uthibitishaji wa utumishi kwa wafanyakazi baada ya kumaliza kipindi cha majaribio",
        "Kuandaa na kupendeza kufuta au kurudisha wafanyakazi wanaoshukiwa kufanya makosa ya nidhamu",
        "Kuratibu utekelezwaji wa Mwongozo wa Kuendeleza wafanyakazi kulingana na Mpango wa Utumishi",
        "Kukagua na kupendeza kwa Tume ya Utumishi wa Umma Mpango wa Utumishi wa Wizara kwa uidhinishaji",
        "Kuzingatia na kupendeza likizo bila malipo kwa watumishi wa serikali",
        "Kupendeza kumaliza utumishi kwa ustaafu wa hiari, ustaafu wa lazima, na mapendekezo ya Baraza la Daktari",
        "Kuandaa na kutoa mabaraza yanayohusiana na shughuli za Tume",
        "Kuratibu na kupendeza mabadiliko ya kadhi kwa wafanyakazi",
        "Kufanya shughuli nyingi zinazolingana na Idara au kama alivyoagizwa na Katibu wa Tume",
        "Kuandaa ripoti za robo, nusu mwaka, na mwaka za utekelezwaji zinazowasilishwa kwa Katibu wa Tume",
      ],
      responsibilities_en: [
        "Coordinates, advises, and recommends extension of service for employees reaching compulsory retirement age",
        "Receives, listens to, and analyzes employee complaints and appeals submitted to the Commission",
        "Prepares and recommends confirmation of service for employees after completing probation",
        "Prepares and recommends dismissal or reinstatement of employees suspected of disciplinary offences",
        "Coordinates implementation of Promotion Guidelines per the Scheme of Service",
        "Reviews and recommends to the Public Service Commission the Scheme of Services of Ministries for approval",
        "Considers and recommends leave without pay for civil servants",
        "Recommends termination of service for voluntary retirement, compulsory retirement, and Medical Board recommendations",
        "Prepares and issues circulars pertaining to Commission activities",
        "Coordinates and recommends changing of cadre for employees",
        "Performs other activities/functions consistent with the Department or as assigned by the Commission Secretary",
        "Prepares quarterly, half-yearly, and annual implementation reports submitted to the Commission Secretary",
      ],
    },
    {
      name_sw: "Idara ya Uteuzi na Udhibiti wa Ubora",
      name_en: "Department of Recruitment and Quality Control",
      responsibilities_sw: [
        "Kupokea vibali vya uteuzi kutoka Ofisi ya Kuu ya Utumishi wa Umma na kuvitangaza kwa umma",
        "Kufanya na kusimamia uteuzi wa wafanyakazi wapya katika Serikali ya Kati",
        "Kupokea maombi ya ajira kwa ajili ya uchaguzi wa awali",
        "Kusimamia, kufuatilia, na kutathmini mchakato wa uteuzi wa Serikali ya Kati",
        "Kuandaa na kusimamia usaili wa andishi na wa mdomo kwa wagombea waliokubaliwa wenye vigezo vinavyofaa",
        "Kuandaa na kutoa vibali vya ajira kwa Wizara kama ilivyoidhinishwa na Tume",
        "Kuidhinisha ajiri za Mikataba ya Kipekee baada ya kupata idhini kutoka Katibu wa Baraza la Mapinduzi na Katibu Mkuu",
        "Kuandaa ripoti za robo, nusu mwaka, na mwaka za utekelezwaji zinazowasilishwa kwa Katibu wa Tume",
        "Kufanya shughuli nyingi zinazolingana na Idara au kama alivyoagizwa na Katibu wa Tume",
      ],
      responsibilities_en: [
        "Receiving recruitment permits from the Head Office of The Public Service and advertising to the public",
        "Conducts and supervises recruitment of new employees in Central Government",
        "Receives employment applications for shortlisting",
        "Administers, monitors, and evaluates the Central Government recruitment process",
        "Preparation and management of written and oral interviews for shortlisted applicants who have reached the appropriate criteria",
        "Prepares and issues employment permits to Ministries as approved by the Commission",
        "Approves employment of Special Contracts after obtaining permit from the Secretary of the Revolutionary Council and the Chief Secretary",
        "Prepares quarterly, half-yearly, and yearly implementation reports submitted to the Commission Secretary",
        "Performs other activities/functions consistent with the Department or as assigned by the Commission Secretary",
      ],
    },
  ];

  return (
    <div className="container-main py-8">
      <Breadcrumb
        items={[
          { label: t("nav.organization_structure"), href: "/organization-structure" },
          { label: t("nav.department") },
        ]}
      />
      <h1 className="text-3xl font-bold text-primary mb-8">
        {t("org_structure.department")}
      </h1>
      <div className="space-y-8">
        {departments.map((dept, dIndex) => (
          <div
            key={dIndex}
            className="bg-white rounded-lg border border-border shadow-sm overflow-hidden"
          >
            <div className="bg-primary text-white p-4">
              <h2 className="text-xl font-semibold">
                {locale === "sw" ? dept.name_sw : dept.name_en}
              </h2>
            </div>
            <div className="p-6">
              <ol className="space-y-3 list-decimal list-inside">
                {(locale === "sw" ? dept.responsibilities_sw : dept.responsibilities_en).map((resp, rIndex) => (
                  <li key={rIndex} className="text-muted leading-relaxed">
                    {resp}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}