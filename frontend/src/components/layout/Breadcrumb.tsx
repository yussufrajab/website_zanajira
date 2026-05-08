import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";
import { ChevronRight, Home } from "lucide-react";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
};

export async function Breadcrumb({ items }: Props) {
  const t = await getTranslations();

  return (
    <nav aria-label="Breadcrumb" className="py-3">
      <ol className="flex items-center gap-1.5 text-sm text-muted flex-wrap">
        <li>
          <Link
            href="/"
            className="hover:text-primary no-underline flex items-center gap-1"
          >
            <Home size={14} />
            <span className="hidden sm:inline">{t("nav.home")}</span>
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            <ChevronRight size={14} className="text-muted/50" />
            {item.href ? (
              <a
                href={item.href}
                className="hover:text-primary no-underline"
              >
                {item.label}
              </a>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}