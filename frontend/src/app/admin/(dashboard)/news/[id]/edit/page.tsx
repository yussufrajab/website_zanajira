import { NewsForm } from "@/components/admin/NewsForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditNewsPage({ params }: Props) {
  const { id } = await params;
  return <NewsForm id={Number(id)} />;
}