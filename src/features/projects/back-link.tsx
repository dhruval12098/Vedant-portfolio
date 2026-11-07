"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { originSlug } from "@/features/tissue-transition";

/*
 * Back to the work. Arrived by the tissue pull: go back in history, so the home page <Activity>
 * kept comes back exactly as it was and the sheet folds back into its card. Arrived directly:
 * a plain link to the projects section.
 */
export function BackLink({ slug, className }: { slug: string; className?: string }): React.ReactElement {
  const router = useRouter();
  return (
    <Link
      href="/#projects"
      className={className}
      onClick={(event) => {
        if (originSlug() !== slug) return;
        event.preventDefault();
        router.back();
      }}
    >
      ← Back to projects
    </Link>
  );
}
