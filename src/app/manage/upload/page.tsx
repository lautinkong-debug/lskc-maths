import { UploadForm } from "@/components/books/UploadForm";

export default async function UploadPage({
  searchParams,
}: {
  searchParams: Promise<{
    topic?: string | string[];
    level?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const topic = typeof params.topic === "string" ? params.topic : "";
  const level = typeof params.level === "string" ? params.level : "";
  return (
    <UploadForm
      key={JSON.stringify([topic, level])}
      initialTopicId={topic}
      initialLevel={level}
    />
  );
}
