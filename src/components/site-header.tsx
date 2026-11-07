import Link from "next/link";
import { MobileMenu } from "./mobile-menu";
import { NAV } from "./nav";
import styles from "./site-header.module.css";

/*
 * The bar across the top: name, sections, contact, spread over the full width with a rule
 * under them, set in the terminal face. On small screens: the name and a Menu button that opens
 * the half-sheet (mobile-menu.tsx).
 */
export function SiteHeader(): React.ReactElement {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.home}>
        Vedant
      </Link>
      <nav aria-label="Primary" className={styles.nav}>
        <ul>
          {NAV.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.menu}>
        <MobileMenu />
      </div>
    </header>
  );
}
