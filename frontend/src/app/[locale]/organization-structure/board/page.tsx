import { setRequestLocale, getTranslations } from "next-intl/server";
import { Locale } from "@/lib/locale";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function BoardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const loc = locale as Locale;

  const boardMembers = [
    { name: "Kombo Hassan Juma", role_sw: "Mwenyekiti", role_en: "Chairperson" },
    { name: "Juma Haji Juma", role_sw: "Mjumbe", role_en: "Member" },
    { name: "Yussuf Ali Salim", role_sw: "Mjumbe", role_en: "Member" },
    { name: "Salama Komb Ahmed", role_sw: "Mjumbe", role_en: "Member" },
    { name: "Maryam Abdalla Yussuf", role_sw: "Mjumbe", role_en: "Member" },
    { name: "Asha Ali Ameir", role_sw: "Mjumbe", role_en: "Member" },
    { name: "Zuhura Shamis Abdalla", role_sw: "Mjumbe", role_en: "Member" },
  ];

  return (
    <div className="container-main py-8">
      <Breadcrumb
        items={[
          { label: t("nav.organization_structure"), href: "/organization-structure" },
          { label: t("nav.board") },
        ]}
      />
      <h1 className="text-3xl font-bold text-primary mb-8">
        {t("org_structure.board")}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {boardMembers.map((member, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-border shadow-sm p-6 text-center hover:shadow-md transition-shadow"
          >
            <div className="w-24 h-24 bg-primary-light rounded-full mx-auto mb-4 flex items-center justify-center text-primary text-2xl font-bold">
              {member.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <h3 className="font-semibold text-lg text-foreground">
              {member.name}
            </h3>
            <p className="text-muted text-sm mt-1">
              {loc === "sw" ? member.role_sw : member.role_en}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}