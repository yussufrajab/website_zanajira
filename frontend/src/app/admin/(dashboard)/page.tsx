import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function AdminDashboardPage() {
  const [newsCounts, vacancyCounts, interviewCounts] = await Promise.all([
    prisma.news.groupBy({ by: ["status"], _count: true }),
    prisma.vacancy.groupBy({ by: ["status"], _count: true }),
    prisma.interview.groupBy({ by: ["status"], _count: true }),
  ]);

  const countOf = (rows: { status: string; _count: number }[], status: string) =>
    rows.find((r) => r.status === status)?._count ?? 0;

  const cards = [
    {
      label: "News",
      href: "/admin/news",
      published: countOf(newsCounts, "published"),
      draft: countOf(newsCounts, "draft"),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
        </svg>
      ),
    },
    {
      label: "Vacancies",
      href: "/admin/vacancies",
      published: countOf(vacancyCounts, "published"),
      draft: countOf(vacancyCounts, "draft"),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
        </svg>
      ),
    },
    {
      label: "Interviews",
      href: "/admin/interviews",
      published: countOf(interviewCounts, "published"),
      draft: countOf(interviewCounts, "draft"),
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted mt-1">
          Overview of your content
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="block bg-white rounded-xl border border-border p-6 hover:shadow-lg hover:border-primary/20 transition-all no-underline group"
          >
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {c.label}
              </h2>
              <span className="text-muted group-hover:text-primary transition-colors">
                {c.icon}
              </span>
            </div>
            <div className="flex items-center gap-5 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success" />
                <span className="text-muted">
                  Published <strong className="text-foreground">{c.published}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-warning" />
                <span className="text-muted">
                  Draft <strong className="text-foreground">{c.draft}</strong>
                </span>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-border">
              <span className="text-sm font-medium text-primary group-hover:text-primary-dark transition-colors">
                Manage {c.label.toLowerCase()} &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}