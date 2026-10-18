import { copy } from "@/lib/copy";

export function SiteFooter() {
  return (
    <footer data-studio-footer="true" className="border-grid border-t">
      <div className="text-pencil text-meta mx-auto flex w-full max-w-[1400px] flex-col gap-1 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          {copy.school.name} &middot; {copy.footer.builtFor}
        </p>
        <p>順德聯誼總會李兆基中學</p>
      </div>
    </footer>
  );
}
