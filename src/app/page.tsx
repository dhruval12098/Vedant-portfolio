import { SiteFooter } from "@/components/site-footer";
import { Expertise } from "@/features/expertise/expertise";
import { Path } from "@/features/path/path";
import { Projects } from "@/features/projects/projects";
import { Statement } from "@/features/statement/statement";

export default function HomePage(): React.ReactElement {
  return (
    <>
      <main>
        <Statement />
        <Expertise />
        <Path />
        <Projects />
      </main>
      <SiteFooter />
    </>
  );
}
