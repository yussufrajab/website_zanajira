import { setRequestLocale, getTranslations } from "next-intl/server";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function UnitDivisionPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();

  // Units that report directly to the Commission Secretary
  const units = [
    { name_sw: "Kitengo cha Uhasibu", name_en: "Accounting Section" },
    { name_sw: "Kitengo cha Ununuzi", name_en: "Procurement" },
    { name_sw: "Kitengo cha ICT", name_en: "ICT" },
    { name_sw: "Kitengo cha Uhusiano na Umma", name_en: "Public Relations" },
    { name_sw: "Kitengo cha Ukaguzi wa Ndani", name_en: "Internal Auditing" },
    { name_sw: "Kitengo cha Sheria", name_en: "Law" },
  ];

  // Departments with their divisions
  const departments = [
    {
      name_sw: "Idara ya Rasilimali Watu, Utawala na Mipango",
      name_en: "Department of Human Resources, Administration and Planning",
      divisions: [
        { name_sw: "Mgawanyiko wa Rasilimali Watu na Utawala", name_en: "Division of Human Resources and Administration" },
        { name_sw: "Mgawanyiko wa Mipango, Ufuatiliaji na Tathmini", name_en: "Division of Planning, Monitoring and Evaluation" },
      ],
    },
    {
      name_sw: "Idara ya Usimamizi wa Rasilimali Watu",
      name_en: "Department of Human Resource Management",
      divisions: [
        { name_sw: "Mgawanyiko wa Miongozo ya Utawala", name_en: "Division of Guideline Administration" },
        { name_sw: "Mgawanyiko wa Masuala ya Nidhamu", name_en: "Division of Disciplinary Matters" },
      ],
    },
    {
      name_sw: "Idara ya Uteuzi na Udhibiti wa Ubora",
      name_en: "Department of Recruitment and Quality Control",
      divisions: [
        { name_sw: "Mgawanyiko wa Tangazo la Ajira na Takwimu", name_en: "Division of Job Advertisement and Statistics" },
        { name_sw: "Mgawanyiko wa Tathmini ya Wagombea wa Ajira", name_en: "Division of Evaluation of Job Applicants" },
      ],
    },
  ];

  return (
    <div className="container-main py-8">
      <Breadcrumb
        items={[
          { label: t("nav.organization_structure"), href: "/organization-structure" },
          { label: t("nav.unit_division") },
        ]}
      />
      <h1 className="text-3xl font-bold text-primary mb-8">
        {t("org_structure.unit_division")}
      </h1>

      {/* Units reporting to Commission Secretary */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-primary mb-4 border-b border-border pb-2">
          {locale === "sw" ? "Vitengo vinavyoripoti moja kwa moja kwa Katibu wa Tume" : "Units Reporting Directly to the Commission Secretary"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {units.map((unit, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-border p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center text-primary font-bold text-sm">
                  {index + 1}
                </div>
                <h3 className="font-medium text-foreground">
                  {locale === "sw" ? unit.name_sw : unit.name_en}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Departments with their divisions */}
      {departments.map((dept, dIndex) => (
        <section key={dIndex} className="mb-8">
          <h2 className="text-xl font-semibold text-primary mb-4 border-b border-border pb-2">
            {locale === "sw" ? dept.name_sw : dept.name_en}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dept.divisions.map((div, divIndex) => (
              <div
                key={divIndex}
                className="bg-white rounded-lg border border-border p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {String.fromCharCode(65 + divIndex)}
                  </div>
                  <h3 className="font-medium text-foreground">
                    {locale === "sw" ? div.name_sw : div.name_en}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}