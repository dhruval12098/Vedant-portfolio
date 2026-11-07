import Link from "next/link";
import { person } from "@/content/person";
import { NAV } from "./nav";
import styles from "./site-footer.module.css";

/* The end of the page, in the terminal's voice: the name once more, links, and how to reach him. */
export function SiteFooter(): React.ReactElement {
  return (
    <footer id="contact" className={styles.footer}>
      <p className={styles.log} aria-hidden="true">
        <span>--EOF:</span>
        <span>:--CONTACT:</span>
        <span>:DETAILS ON REQUEST</span>
      </p>
      <p className={styles.name} aria-hidden="true">
        {person.name}
      </p>
      <div className={styles.bottom}>
        <p>{person.role}</p>
        <nav aria-label="Footer">
          <ul className={styles.links}>
            {NAV.filter((item) => item.label !== "Contact").map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className={styles.copy}>All rights reserved. ©2026</p>
      </div>
    </footer>
  );
}
