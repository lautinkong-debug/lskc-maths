import Tug from "@/components/polynomial-tug/Tug";
import { copy } from "@/lib/copy";
export const metadata = { title: copy.polynomialTug.title };
export default async function PolynomialTugPage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string | string[] }>;
}) {
  const { room } = await searchParams;
  return (
    <Tug
      initialCode={typeof room === "string" ? room.trim().toUpperCase() : ""}
    />
  );
}
