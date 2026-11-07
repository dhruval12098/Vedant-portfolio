import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { Expertise } from "@/features/expertise/expertise";
import { Projects } from "@/features/projects/projects";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Vedant's projects: House of Diams, Shreeram Milks and the Speaker app. Websites and apps written in Java and for the web, each one tested before it shipped.",
};

export default function WorkPage(): React.ReactElement {
  return (
    <>
      <main>
        <Expertise />
        <Projects />
      </main>
      <SiteFooter />
    </>
  );
}
