import { auth } from "@clerk/nextjs/server";
import { AppShell } from "@/components/app-shell";

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // auth.protect() called from a page/layout 404s by default when signed
  // out; unauthenticatedUrl overrides that to a redirect instead.
  await auth.protect({ unauthenticatedUrl: "/sign-in" });

  return <AppShell>{children}</AppShell>;
}
