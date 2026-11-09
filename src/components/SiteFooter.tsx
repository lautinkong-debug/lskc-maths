import { copy } from "@/lib/copy";

export function SiteFooter() {
  return (
    <footer data-studio-footer="true" className="portal-footer">
      <div>
        <p>
          <strong>{copy.school.short}</strong>
          <span>{copy.school.name}</span>
        </p>
        <p lang="zh-HK">順德聯誼總會李兆基中學</p>
      </div>
    </footer>
  );
}
