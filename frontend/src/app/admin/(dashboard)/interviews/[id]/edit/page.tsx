import { InterviewForm } from "@/components/admin/InterviewForm";

type Props = { params: Promise<{ id: string }> };

export default async function EditInterviewPage({ params }: Props) {
  const { id } = await params;
  return <InterviewForm id={Number(id)} />;
}