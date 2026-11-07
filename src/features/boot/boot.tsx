import type { CSSProperties } from "react";
import styles from "./boot.module.css";

/** The log, as a staircase: each line indented a little further, typed in turn. */
const LOG: readonly { text: string; indent: number }[] = [
  { text: "--INITIALIZING:", indent: 0 },
  { text: ":--ENVIRONMENT:", indent: 3 },
  { text: ":JAVA / QUALITY ASSURANCE:", indent: 9 },
  { text: ":--LOADING:", indent: 25 },
  { text: ":--CONTEXT", indent: 31 },
];

/*
 * The boot loader: a terminal bringing the site up. Server-rendered and pure CSS (it runs before
 * the page hydrates), shown only while html[data-intro="play"]. Lines type in, the counter runs
 * to 100, the status goes BOOTING → COMPILING → BUILD SUCCESSFUL, then the sheet lifts away.
 */
export function Boot(): React.ReactElement {
  return (
    <div className={styles.boot} aria-hidden="true">
      <p className={styles.title}>
        <span className={styles.type} style={{ "--n": 16, "--at": "80ms" } as CSSProperties}>
          WEBSITE / VEDANT
        </span>
      </p>
      <div className={styles.log}>
        {LOG.map((line, i) => (
          <p key={line.text} style={{ "--indent": `${line.indent}ch` } as CSSProperties}>
            <span className={styles.type} style={{ "--n": line.text.length, "--at": `${300 + i * 190}ms` } as CSSProperties}>
              {line.text}
            </span>
          </p>
        ))}
      </div>
      <div className={styles.status}>
        <span className={styles.count} />
        <span>
          <span className={styles.type} style={{ "--n": 10, "--at": "450ms" } as CSSProperties}>
            :--STATUS:
          </span>
          <span className={styles.states}>
            <span>:BOOTING</span>
            <span>:COMPILING</span>
            <span>:BUILD SUCCESSFUL</span>
          </span>
        </span>
      </div>
    </div>
  );
}
