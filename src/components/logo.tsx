type NavLogoProps = {
  className?: string;
};

// Real brand assets (icon mark + wordmark lockup), not a plain text
// wordmark — see /public/logo. Two SVGs (light/dark) rather than one
// currentColor-driven file since the wordmark's own fill colors differ
// per theme; both render, CSS just shows the right one, avoiding any
// flash-of-wrong-logo from a JS-driven theme check.
export function NavLogo({ className = "h-7" }: NavLogoProps) {
  return (
    <>
      <img src="/logo/navbar-lockup-light.svg" alt="CareHub" className={`${className} w-auto dark:hidden`} />
      <img
        src="/logo/navbar-lockup-dark.svg"
        alt="CareHub"
        className={`${className} hidden w-auto dark:block`}
      />
    </>
  );
}
