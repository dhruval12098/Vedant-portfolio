import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProjectPage } from "@/features/projects/project-page";
import { projects } from "@/content/projects";

export function generateStaticParams(): { slug: string }[] {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.name,
    description: `${project.name}: ${project.summary} How it was built, what it does and how Vedant tested it.`.slice(0, 160),
  };
}

/*
 * `params` is read under <Suspense> (instant navigation): every project is still prerendered
 * whole from generateStaticParams; the fallback, the dark full-screen hero, only fills the
 * route's shared navigation shell.
 */
export default function Page({ params }: PageProps<"/projects/[slug]">): React.ReactElement {
  return (
    <Suspense fallback={<main style={{ height: "100svh", background: "var(--night-bg)" }} />}>
      <Project params={params} />
    </Suspense>
  );
}

async function Project({ params }: { params: PageProps<"/projects/[slug]">["params"] }): Promise<React.ReactElement> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  return <ProjectPage slug={project.slug} />;
}
