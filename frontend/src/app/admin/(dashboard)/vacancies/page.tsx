import Link from "next/link";
import { prisma } from "@/lib/db";
import { ListFilter } from "@/components/admin/ListFilter";
import { Pagination } from "@/components/admin/Pagination";

const PER_PAGE = 15;

const statusBadge: Record<string, string> = {
  published: "bg-success/10 text-success ring-1 ring-success/20",
  draft: "bg-warning/10 text-warning ring-1 ring-warning/20",
  closed: "bg-gray-100 text-muted ring-1 ring-gray-200",
};

type Props = {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
};

export default async function AdminVacanciesListPage({ searchParams }: Props) {
  const { q, status, page: pageStr } = await searchParams;
  const page = Math.max(1, Number(pageStr) || 1);

  const where: Record<string, unknown> = {};
  if (status) {
    where.status = status;
  }
  if (q) {
    where.OR = [
      { titleEn: { contains: q, mode: "insensitive" } },
      { titleSw: { contains: q, mode: "insensitive" } },
      { institutionEn: { contains: q, mode: "insensitive" } },
      { institutionSw: { contains: q, mode: "insensitive" } },
    ];
  }

  const [total, rows] = await Promise.all([
    prisma.vacancy.count({ where }),
    prisma.vacancy.findMany({
      where,
      orderBy: { datePosted: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
  ]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vacancies</h1>
          <p className="text-sm text-muted mt-1">
            {total} {total === 1 ? "item" : "items"}
          </p>
        </div>
        <Link
          href="/admin/vacancies/new"
          style={{ color: "#fff" }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium no-underline hover:bg-primary-dark transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New vacancy
        </Link>
      </div>

      <div className="mb-6">
        <ListFilter
          placeholder="Search by title or institution…"
          statusOptions={[
            { value: "published", label: "Published" },
            { value: "draft", label: "Draft" },
            { value: "closed", label: "Closed" },
          ]}
        />
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface border-b border-border">
              <th className="px-5 py-3.5 text-left font-semibold text-foreground">Title (EN)</th>
              <th className="px-5 py-3.5 text-left font-semibold text-foreground">Institution</th>
              <th className="px-5 py-3.5 text-left font-semibold text-foreground">Status</th>
              <th className="px-5 py-3.5 text-left font-semibold text-foreground">Deadline</th>
              <th className="px-5 py-3.5 text-right font-semibold text-foreground"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-muted">
                  No vacancies found.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 font-medium text-foreground">{r.titleEn}</td>
                <td className="px-5 py-4 text-muted">
                  {r.institutionEn ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-muted text-xs font-medium">
                      {r.institutionEn}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[r.status] ?? ""}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-muted">
                  {r.deadlineDate
                    ? r.deadlineDate.toISOString().slice(0, 10)
                    : "—"}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link
                    href={`/admin/vacancies/${r.id}/edit`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary-light rounded-lg transition-colors no-underline"
                  >
                    Edit
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination total={total} page={page} perPage={PER_PAGE} />
      </div>
    </div>
  );
}