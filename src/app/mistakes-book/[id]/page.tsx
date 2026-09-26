import { BookDetail } from "@/components/books/BookDetail";

export default async function Page({
  params,
}: PageProps<"/mistakes-book/[id]">) {
  const { id } = await params;
  return <BookDetail id={id} />;
}
