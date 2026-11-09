"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { resourceReturn, type CollectionPath } from "@/lib/resourceNavigation";
import { resourceNavigationCopy as c } from "@/lib/resourceNavigationCopy";

type Props = {
  collection: CollectionPath;
  className?: string;
  children: ReactNode;
};

function ContextLink({ collection, className, children }: Props) {
  const target = resourceReturn(collection, useSearchParams());
  return (
    <Link prefetch={false} href={target.href} className={className}>
      {target.form ? `← ${c.backToForm(target.form)}` : children}
    </Link>
  );
}

export function ResourceBackLink(props: Props) {
  return (
    <Suspense
      fallback={
        <Link
          prefetch={false}
          href={props.collection}
          className={props.className}
        >
          {props.children}
        </Link>
      }
    >
      <ContextLink {...props} />
    </Suspense>
  );
}
