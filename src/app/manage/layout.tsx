import { RequireRole } from "@/components/AuthGate";
import Link from "next/link";
import { copy } from "@/lib/copy";

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireRole role="teacher">
      <nav
        aria-label={copy.nav.manage}
        className="border-grid bg-navy-wash border-b"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap gap-x-6 gap-y-2 px-4 py-3 text-sm font-semibold sm:px-6">
          <Link className="text-navy hover:underline" href="/manage/upload">
            {copy.nav.upload}
          </Link>
          <Link className="text-navy hover:underline" href="/manage/books">
            {copy.nav.manageBooks}
          </Link>
          <Link className="text-navy hover:underline" href="/manage/topics">
            {copy.nav.manageTopics}
          </Link>
        </div>
      </nav>
      {children}
    </RequireRole>
  );
}
