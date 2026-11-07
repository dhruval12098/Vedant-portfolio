import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { About } from "@/features/about/about";
import { Path } from "@/features/path/path";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Vedant: a Java developer who tests what he builds. His skills in Java, Python and the web, how he works, and the schools and college that led him here.",
};

export default function AboutPage(): React.ReactElement {
  return (
    <>
      <main>
        <About />
        <Path />
      </main>
      <SiteFooter />
    </>
  );
}
