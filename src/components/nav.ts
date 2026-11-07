/* Site navigation, shared by the header bar and the mobile menu. */
export interface NavItem {
  href: string;
  label: string;
}

export const NAV: readonly NavItem[] = [
  { href: "/#expertise", label: "Expertise" },
  { href: "/#path", label: "Education" },
  { href: "/#projects", label: "Work" },
  { href: "/about", label: "About" },
  { href: "/#contact", label: "Contact" },
];
