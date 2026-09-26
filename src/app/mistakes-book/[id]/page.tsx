import { BookDetail } from "@/components/books/BookDetail";
import type { Metadata } from "next";
import { copy } from "@/lib/copy";

export const metadata: Metadata = { title: copy.books.detailTitle };

export default async function Page({
  params,
}: PageProps<"/mistakes-book/[id]">) {
  const { id } = await params;
  return <BookDetail id={id} />;
}
