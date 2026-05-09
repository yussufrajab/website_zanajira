import { setRequestLocale, getTranslations } from "next-intl/server";
import { Breadcrumb } from "@/components/layout/Breadcrumb";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function OrganizationChartPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations();
  const isSw = locale === "sw";

  return (
    <div className="container-main py-8">
      <Breadcrumb
        items={[
          { label: t("nav.organization_structure"), href: "/organization-structure" },
          { label: t("nav.organization_chart") },
        ]}
      />
      <h1 className="text-3xl font-bold text-primary mb-8">
        {t("org_structure.organization_chart")}
      </h1>

      <div className="overflow-x-auto">
        <svg
          width="100%"
          viewBox="0 0 680 820"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          className="block"
        >
          <title>
            {isSw
              ? "Chati ya muundo wa Tume ya Utumishi Serikalini"
              : "Civil Services Commission organisational chart"}
          </title>
          <desc>
            {isSw
              ? "Chati ya muundo kutoka Tume ya Utumishi Serikalini juu, kupitia Katibu, vitengo sita, na idara tatu na mgawanyiko mdogo pamoja na Ofisi ya Pemba"
              : "Org chart from Civil Services Commission at the top, through the Secretary, six units, and three departments with sub-divisions plus Pemba Office"}
          </desc>
          <defs>
            <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </marker>
            <linearGradient id="hdrGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#534AB7"/>
              <stop offset="100%" stopColor="#1b5e20"/>
            </linearGradient>
            <linearGradient id="secGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3C3489"/>
              <stop offset="100%" stopColor="#0e3b12"/>
            </linearGradient>
          </defs>

          {/* HEADER BANNER */}
          <g>
            <rect x="160" y="18" width="360" height="48" rx="12" fill="url(#hdrGrad)"/>
            <text x="340" y="37" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="500" fill="#EEEDFE" fontFamily="var(--font-sans)">
              {isSw ? "Tume ya Utumishi Serikalini" : "Civil Services Commission"}
            </text>
            <text x="340" y="55" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#AFA9EC" fontFamily="var(--font-sans)">
              {isSw ? "Zanzibar" : "Zanzibar"}
            </text>
          </g>

          {/* connector: header → secretary */}
          <line x1="340" y1="66" x2="340" y2="96" stroke="#7F77DD" strokeWidth="1.5" markerEnd="url(#arr)" fill="none"/>

          {/* SECRETARY */}
          <g>
            <rect x="215" y="96" width="250" height="50" rx="10" fill="url(#secGrad)" stroke="#AFA9EC" strokeWidth="0.5"/>
            <text x="340" y="115" textAnchor="middle" dominantBaseline="central" fontSize="14" fontWeight="500" fill="#EEEDFE" fontFamily="var(--font-sans)">
              {isSw ? "Katibu" : "Secretary"}
            </text>
            <text x="340" y="133" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#a5d6a7" fontFamily="var(--font-sans)">
              {isSw ? "Mkuu wa Tume" : "Head of commission"}
            </text>
          </g>

          {/* vertical spine from secretary */}
          <line x1="340" y1="146" x2="340" y2="186" stroke="#7F77DD" strokeWidth="1.5" fill="none"/>

          {/* SIX UNITS — bracket on left of spine */}
          <line x1="340" y1="186" x2="340" y2="438" stroke="#7F77DD" strokeWidth="1" fill="none"/>

          {/* Unit labels - bilingual */}
          {[
            { sw: "Kitengo cha Uhasibu", en: "Accounting unit", y: 209 },
            { sw: "Kitengo cha Ununuzi", en: "Procurement & supply unit", y: 251 },
            { sw: "Kitengo cha Sheria", en: "Legal unit", y: 293 },
            { sw: "Kitengo cha Uhusiano na Umma", en: "Public relations unit", y: 335 },
            { sw: "Kitengo cha ICT", en: "Information & technology unit", y: 373 },
            { sw: "Kitengo cha Ukaguzi wa Ndani", en: "Internal auditing unit", y: 423 },
          ].map((unit, i) => {
            const boxHeight = i === 4 ? 38 : 34;
            const boxY = i === 4 ? 360 : unit.y - 17;
            return (
              <g key={i}>
                <rect x="148" y={boxY} width="168" height={boxHeight} rx="7" fill="#EEEDFE" stroke="#534AB7" strokeWidth="0.5"/>
                {i === 4 ? (
                  <>
                    <text x="232" y={boxY + 13} textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#3C3489" fontFamily="var(--font-sans)">
                      {isSw ? unit.sw.split(" ")[0] : "Information &"}
                    </text>
                    <text x="232" y={boxY + 28} textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#3C3489" fontFamily="var(--font-sans)">
                      {isSw ? unit.sw.split(" ").slice(1).join(" ") : "technology unit"}
                    </text>
                  </>
                ) : (
                  <text x="232" y={unit.y} textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#3C3489" fontFamily="var(--font-sans)">
                    {isSw ? unit.sw : unit.en}
                  </text>
                )}
                <line x1="316" y1={unit.y} x2="340" y2={unit.y} stroke="#7F77DD" strokeWidth="0.8" fill="none"/>
              </g>
            );
          })}

          {/* HORIZONTAL SPINE TO DEPARTMENTS */}
          <line x1="340" y1="438" x2="340" y2="462" stroke="#1b5e20" strokeWidth="1.5" fill="none"/>
          <line x1="75" y1="462" x2="605" y2="462" stroke="#1b5e20" strokeWidth="1.5" fill="none"/>

          {/* verticals down to 4 nodes */}
          <line x1="75" y1="462" x2="75" y2="482" stroke="#1b5e20" strokeWidth="1.5" fill="none"/>
          <line x1="248" y1="462" x2="248" y2="482" stroke="#1b5e20" strokeWidth="1.5" fill="none"/>
          <line x1="432" y1="462" x2="432" y2="482" stroke="#1b5e20" strokeWidth="1.5" fill="none"/>
          <line x1="605" y1="462" x2="605" y2="482" stroke="#1b5e20" strokeWidth="1.5" fill="none"/>

          {/* DEPT 1: HR Administration & Planning */}
          <g>
            <rect x="18" y="482" width="114" height="62" rx="9" fill="#0e3b12" stroke="#2e8d3e" strokeWidth="0.8"/>
            <text x="75" y="499" textAnchor="middle" dominantBaseline="central" fontSize="10.5" fontWeight="500" fill="#a5d6a7" fontFamily="var(--font-sans)">
              {isSw ? "Idara ya" : "Dept of Human"}
            </text>
            <text x="75" y="513" textAnchor="middle" dominantBaseline="central" fontSize="10.5" fontWeight="500" fill="#a5d6a7" fontFamily="var(--font-sans)">
              {isSw ? "Rasilimali Watu," : "Resources, Admin"}
            </text>
            <text x="75" y="527" textAnchor="middle" dominantBaseline="central" fontSize="10.5" fontWeight="500" fill="#a5d6a7" fontFamily="var(--font-sans)">
              {isSw ? "Utawala & Mipango" : "& Planning"}
            </text>
          </g>

          {/* DEPT 2: HR Management */}
          <g>
            <rect x="191" y="482" width="114" height="62" rx="9" fill="#0e3b12" stroke="#2e8d3e" strokeWidth="0.8"/>
            <text x="248" y="499" textAnchor="middle" dominantBaseline="central" fontSize="10.5" fontWeight="500" fill="#a5d6a7" fontFamily="var(--font-sans)">
              {isSw ? "Idara ya" : "Dept of Human"}
            </text>
            <text x="248" y="513" textAnchor="middle" dominantBaseline="central" fontSize="10.5" fontWeight="500" fill="#a5d6a7" fontFamily="var(--font-sans)">
              {isSw ? "Usimamizi wa" : "Resource"}
            </text>
            <text x="248" y="527" textAnchor="middle" dominantBaseline="central" fontSize="10.5" fontWeight="500" fill="#a5d6a7" fontFamily="var(--font-sans)">
              {isSw ? "Rasilimali Watu" : "Management"}
            </text>
          </g>

          {/* DEPT 3: Recruitment & Quality Control */}
          <g>
            <rect x="375" y="482" width="114" height="62" rx="9" fill="#0e3b12" stroke="#2e8d3e" strokeWidth="0.8"/>
            <text x="432" y="499" textAnchor="middle" dominantBaseline="central" fontSize="10.5" fontWeight="500" fill="#a5d6a7" fontFamily="var(--font-sans)">
              {isSw ? "Idara ya" : "Dept of"}
            </text>
            <text x="432" y="513" textAnchor="middle" dominantBaseline="central" fontSize="10.5" fontWeight="500" fill="#a5d6a7" fontFamily="var(--font-sans)">
              {isSw ? "Uteuzi &" : "Recruitment &"}
            </text>
            <text x="432" y="527" textAnchor="middle" dominantBaseline="central" fontSize="10.5" fontWeight="500" fill="#a5d6a7" fontFamily="var(--font-sans)">
              {isSw ? "Udhibiti wa Ubora" : "Quality Control"}
            </text>
          </g>

          {/* PEMBA OFFICE */}
          <g>
            <rect x="548" y="482" width="114" height="62" rx="9" fill="#3C3489" stroke="#AFA9EC" strokeWidth="0.8"/>
            <text x="605" y="506" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="500" fill="#EEEDFE" fontFamily="var(--font-sans)">
              {isSw ? "Pemba" : "Pemba"}
            </text>
            <text x="605" y="522" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#AFA9EC" fontFamily="var(--font-sans)">
              {isSw ? "Ofisi" : "office"}
            </text>
          </g>

          {/* SUB-DIVISIONS */}

          {/* Dept 1 sub-divs */}
          <line x1="75" y1="544" x2="75" y2="564" stroke="#1b5e20" strokeWidth="0.8" fill="none"/>
          <g>
            <rect x="18" y="564" width="114" height="44" rx="7" fill="#e8f5e9" stroke="#1b5e20" strokeWidth="0.5"/>
            <text x="75" y="579" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#0e3b12" fontFamily="var(--font-sans)">
              {isSw ? "Mgawanyiko:" : "Division: HR &"}
            </text>
            <text x="75" y="593" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#0e3b12" fontFamily="var(--font-sans)">
              {isSw ? "Rasilimali Watu & Utawala" : "administration"}
            </text>
          </g>
          <line x1="75" y1="608" x2="75" y2="626" stroke="#1b5e20" strokeWidth="0.8" fill="none"/>
          <g>
            <rect x="18" y="626" width="114" height="44" rx="7" fill="#e8f5e9" stroke="#1b5e20" strokeWidth="0.5"/>
            <text x="75" y="641" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#0e3b12" fontFamily="var(--font-sans)">
              {isSw ? "Mgawanyiko:" : "Division: planning,"}
            </text>
            <text x="75" y="655" textAnchor="middle" dominantBaseline="central" fontSize="10" fill="#0e3b12" fontFamily="var(--font-sans)">
              {isSw ? "Mipango, Ufuatiliaji & Tathmini" : "monitoring & eval"}
            </text>
          </g>

          {/* Dept 2 sub-divs */}
          <line x1="248" y1="544" x2="248" y2="564" stroke="#1b5e20" strokeWidth="0.8" fill="none"/>
          <g>
            <rect x="191" y="564" width="114" height="44" rx="7" fill="#e8f5e9" stroke="#1b5e20" strokeWidth="0.5"/>
            <text x="248" y="579" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#0e3b12" fontFamily="var(--font-sans)">
              {isSw ? "Mgawanyiko:" : "Division:"}
            </text>
            <text x="248" y="593" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#0e3b12" fontFamily="var(--font-sans)">
              {isSw ? "Masuala ya Nidhamu" : "disciplinary matters"}
            </text>
          </g>
          <line x1="248" y1="608" x2="248" y2="626" stroke="#1b5e20" strokeWidth="0.8" fill="none"/>
          <g>
            <rect x="191" y="626" width="114" height="44" rx="7" fill="#e8f5e9" stroke="#1b5e20" strokeWidth="0.5"/>
            <text x="248" y="641" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#0e3b12" fontFamily="var(--font-sans)">
              {isSw ? "Mgawanyiko:" : "Division: guideline"}
            </text>
            <text x="248" y="655" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#0e3b12" fontFamily="var(--font-sans)">
              {isSw ? "Miongozo ya Utawala" : "management"}
            </text>
          </g>

          {/* Dept 3 sub-divs */}
          <line x1="432" y1="544" x2="432" y2="564" stroke="#1b5e20" strokeWidth="0.8" fill="none"/>
          <g>
            <rect x="375" y="564" width="114" height="44" rx="7" fill="#e8f5e9" stroke="#1b5e20" strokeWidth="0.5"/>
            <text x="432" y="579" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#0e3b12" fontFamily="var(--font-sans)">
              {isSw ? "Mgawanyiko:" : "Division: job ads"}
            </text>
            <text x="432" y="593" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#0e3b12" fontFamily="var(--font-sans)">
              {isSw ? "Tangazo la Ajira & Takwimu" : "& statistics"}
            </text>
          </g>
          <line x1="432" y1="608" x2="432" y2="626" stroke="#1b5e20" strokeWidth="0.8" fill="none"/>
          <g>
            <rect x="375" y="626" width="114" height="44" rx="7" fill="#e8f5e9" stroke="#1b5e20" strokeWidth="0.5"/>
            <text x="432" y="641" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#0e3b12" fontFamily="var(--font-sans)">
              {isSw ? "Mgawanyiko:" : "Division: evaluation"}
            </text>
            <text x="432" y="655" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#0e3b12" fontFamily="var(--font-sans)">
              {isSw ? "Tathmini ya Wagombea" : "of job applicants"}
            </text>
          </g>

          {/* LEGEND */}
          <rect x="40" y="710" width="600" height="50" rx="8" fill="none" stroke="#888" strokeWidth="0.5" strokeDasharray="4 3" opacity="0.4"/>
          <rect x="60" y="726" width="14" height="14" rx="3" fill="url(#hdrGrad)" opacity="0.9"/>
          <text x="80" y="735" fontSize="11" fill="#666" fontFamily="var(--font-sans)" dominantBaseline="central">
            {isSw ? "Tume" : "Commission"}
          </text>
          <rect x="160" y="726" width="14" height="14" rx="3" fill="#534AB7" opacity="0.9"/>
          <text x="180" y="735" fontSize="11" fill="#666" fontFamily="var(--font-sans)" dominantBaseline="central">
            {isSw ? "Vitengo" : "Units"}
          </text>
          <rect x="240" y="726" width="14" height="14" rx="3" fill="#0e3b12" opacity="0.9"/>
          <text x="260" y="735" fontSize="11" fill="#666" fontFamily="var(--font-sans)" dominantBaseline="central">
            {isSw ? "Idara" : "Departments"}
          </text>
          <rect x="370" y="726" width="14" height="14" rx="3" fill="#e8f5e9" stroke="#1b5e20" strokeWidth="0.8"/>
          <text x="390" y="735" fontSize="11" fill="#666" fontFamily="var(--font-sans)" dominantBaseline="central">
            {isSw ? "Mgawanyiko" : "Sub-divisions"}
          </text>
          <rect x="500" y="726" width="14" height="14" rx="3" fill="#3C3489" opacity="0.9"/>
          <text x="520" y="735" fontSize="11" fill="#666" fontFamily="var(--font-sans)" dominantBaseline="central">
            {isSw ? "Ofisi ya Pemba" : "Pemba office"}
          </text>

          <text x="340" y="790" textAnchor="middle" fontSize="11" fill="#999" opacity="0.5" fontFamily="var(--font-sans)">
            {isSw ? "Chati ya Muundo wa Shirika — Tume ya Utumishi Serikalini" : "Organisational Structure — Civil Services Commission"}
          </text>
        </svg>
      </div>
    </div>
  );
}