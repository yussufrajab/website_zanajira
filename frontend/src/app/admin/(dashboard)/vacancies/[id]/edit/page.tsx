import { VacancyForm } from "@/components/admin/VacancyForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditVacancyPage({ params }: Props) {
  const { id } = await params;
  return <VacancyForm id={Number(id)} />;
}