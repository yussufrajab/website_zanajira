import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["sw", "en"],
  defaultLocale: "sw",
  pathnames: {
    "/": "/",
    "/about-us": {
      sw: "/kuhusu-sisi",
      en: "/about-us",
    },
    "/about-us/introduction": {
      sw: "/kuhusu-sisi/utangulizi",
      en: "/about-us/introduction",
    },
    "/about-us/mission-vision": {
      sw: "/kuhusu-sisi/dira-na-dhamira",
      en: "/about-us/mission-vision",
    },
    "/about-us/core-functions": {
      sw: "/kuhusu-sisi/kazi-msingi",
      en: "/about-us/core-functions",
    },
    "/organization-structure": {
      sw: "/muundo-wa-shirika",
      en: "/organization-structure",
    },
    "/organization-structure/board": {
      sw: "/muundo-wa-shirika/bara",
      en: "/organization-structure/board",
    },
    "/organization-structure/department": {
      sw: "/muundo-wa-shirika/idara",
      en: "/organization-structure/department",
    },
    "/organization-structure/unit-division": {
      sw: "/muundo-wa-shirika/kitengo-mgawanyiko",
      en: "/organization-structure/unit-division",
    },
    "/organization-structure/organization-chart": {
      sw: "/muundo-wa-shirika/chati-ya-shirika",
      en: "/organization-structure/organization-chart",
    },
    "/our-service": {
      sw: "/huduma-yetu",
      en: "/our-service",
    },
    "/contact-us": {
      sw: "/wasiliana-nasi",
      en: "/contact-us",
    },
    "/news": {
      sw: "/habari",
      en: "/news",
    },
    "/vacancies": {
      sw: "/nafasi-za-kazi",
      en: "/vacancies",
    },
    "/interviews": {
      sw: "/mwaliko-wa-usaili",
      en: "/interviews",
    },
    "/search": {
      sw: "/tafuta",
      en: "/search",
    },
  },
});