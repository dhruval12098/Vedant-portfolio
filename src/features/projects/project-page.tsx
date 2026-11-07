import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  caseSrc,
  panel,
  projects,
  type CaseImage,
  type CaseSection,
} from "@/content/projects";
import { BackLink } from "./back-link";
import styles from "./project-page.module.css";

function Shot({
  image,
  sizes,
}: {
  image: CaseImage;
  sizes: string;
}): React.ReactElement {
  return (
    <span
      className={styles.shot}
      style={{ "--ratio": image.ratio } as CSSProperties}
    >
      <Image src={caseSrc(image)} alt={image.alt} fill sizes={sizes} />
    </span>
  );
}

function Section({
  section,
  n,
}: {
  section: CaseSection;
  n: number;
}): React.ReactElement {
  switch (section.kind) {
    case "screens":
      return (
        <figure className={styles.screens}>
          <div
            className={styles.screenRow}
            tabIndex={0}
            aria-label="App screens, scroll sideways"
          >
            {section.images.map((image) => (
              <Shot
                key={image.src}
                image={image}
                sizes="(max-width: 48rem) 62vw, 18vw"
              />
            ))}
          </div>
          {section.caption && <figcaption>{section.caption}</figcaption>}
        </figure>
      );
    case "wide":
      return (
        <figure className={styles.wide}>
          <Shot image={section.image} sizes="(max-width: 72rem) 92vw, 72rem" />
          {section.caption && <figcaption>{section.caption}</figcaption>}
        </figure>
      );
    case "pair":
      return (
        <figure className={styles.pair}>
          <div>
            {section.images.map((image) => (
              <Shot
                key={image.src}
                image={image}
                sizes="(max-width: 48rem) 92vw, 36rem"
              />
            ))}
          </div>
          {section.caption && <figcaption>{section.caption}</figcaption>}
        </figure>
      );
    case "chapter":
      return (
        <section className={styles.chapter}>
          <p className={styles.chapterNo}>{String(n).padStart(3, "0")}</p>
          <div>
            <h2>--{section.title.toUpperCase()}:</h2>
            <p>{section.body}</p>
          </div>
        </section>
      );
    case "checks":
      return (
        <section className={styles.checks}>
          <h2>::{section.title.toUpperCase()}::</h2>
          <ol>
            {section.items.map((item, i) => (
              <li key={item}>
                <span>[{i + 1}]</span> {item}
              </li>
            ))}
          </ol>
        </section>
      );
  }
}

/*
 * A project's page. Its hero fills the screen with the same 7:5 panel the strip shows and the
 * tissue sheet carries, cover-fitted: the sheet lands exactly on it (data-project-hero). Then the
 * case study: the intro, the facts as a terminal box, and the story in screens, photos, numbered
 * chapters and a checklist of what was built and tested.
 */
export function ProjectPage({ slug }: { slug: string }): React.ReactElement {
  const index = projects.findIndex((p) => p.slug === slug);
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  const chapters = project.sections.map(
    (_, i) =>
      project.sections.slice(0, i + 1).filter((s) => s.kind === "chapter")
        .length,
  );
  return (
    <main className={styles.page}>
      <section
        className={styles.hero}
        data-project-hero
        aria-labelledby="project-title"
      >
        <Image
          className={styles.photo}
          src={panel(project.slug, 1400)}
          alt={project.panelAlt}
          fill
          sizes="100vw"
          preload
        />
        <span className={styles.shade} aria-hidden="true" />
        <div className={styles.heroText}>
          <p className={styles.kind}>
            {String(index + 1).padStart(3, "0")} · {project.kind}
          </p>
          <h1 id="project-title" className={styles.title}>
            {project.name}
          </h1>
        </div>
        <BackLink slug={project.slug} className={styles.back} />
      </section>

      <div className={styles.body}>
        <p className={styles.intro}>{project.intro}</p>
        <div className={styles.facts}>
          <p className={styles.factsTitle}>::PROJECT.INFO::</p>
          <dl>
            {(
              [
                ["Client", project.client],
                ["Year", project.year],
                ["Role", project.role],
                ["Services", project.services],
                ["Sector", project.sector],
              ] as const
            ).map(([term, value]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {project.sections.map((section, i) => (
          <Section key={i} section={section} n={chapters[i]} />
        ))}

        <Link href={`/projects/${next.slug}`} className={styles.next}>
          <span>--NEXT PROJECT:</span>
          <span className={styles.nextName}>{next.name} →</span>
        </Link>
      </div>
    </main>
  );
}
