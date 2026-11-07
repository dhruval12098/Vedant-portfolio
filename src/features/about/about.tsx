import { person } from "@/content/person";
import styles from "./about.module.css";

/* About: who he is in a paragraph, and what he works with, as a terminal printout. */
export function About(): React.ReactElement {
  return (
    <section className={styles.about} aria-labelledby="about-title">
      <p className={styles.log} aria-hidden="true">
        <span>--ABOUT:</span>
        <span>:--WHOAMI:</span>
      </p>
      <h1 id="about-title" className={styles.title}>
        {person.name}. Java developer, and the tester who checks his own work.
      </h1>
      <p className={styles.lead}>{person.description}</p>
      <div className={styles.box}>
        <p className={styles.boxTitle}>::STACK::</p>
        <ol>
          {person.skills.map((skill, i) => (
            <li key={skill}>
              <span>[{i + 1}]</span> {skill.toUpperCase()}
            </li>
          ))}
          <li>
            <span>[{person.skills.length + 1}]</span> QA / TESTING
          </li>
        </ol>
      </div>
    </section>
  );
}
