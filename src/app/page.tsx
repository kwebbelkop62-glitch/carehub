import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import Ballpit from "@/components/vendor/Ballpit";
import { BallpitBoundary } from "@/components/ballpit-boundary";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";

export default async function RootPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/upcoming");
  }

  const t = await getTranslations("Landing");

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background">
      <div className="relative h-[400px] w-full overflow-hidden bg-tint sm:h-[450px] lg:h-[500px]">
        <BallpitBoundary fallback={<div className="absolute inset-0" />}>
          <Ballpit
            className="absolute inset-0"
            colors={[0x7f77dd, 0xafa9ec, 0x534ab7, 0xcecbf6]}
            followCursor
          />
        </BallpitBoundary>
        <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <span className="text-base font-medium text-foreground sm:text-lg">
            {t("brand")}
          </span>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-10 text-center sm:max-w-lg sm:py-14 lg:max-w-xl">
        <div>
          <h1 className="text-2xl font-medium leading-tight text-foreground sm:text-3xl lg:text-4xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted sm:max-w-md sm:text-base">
            {t("subtitle")}
          </p>
        </div>
        <div className="mx-auto flex w-full max-w-xs flex-col gap-3">
          <Link
            href="/sign-in"
            className="inline-flex h-[50px] items-center justify-center rounded-xl bg-accent text-base font-medium text-white transition-colors hover:bg-accent-hover"
          >
            {t("signIn")}
          </Link>
          <p className="text-sm text-muted">
            {t("newHere")}{" "}
            <Link
              href="/sign-up"
              className="font-medium text-accent-hover hover:underline"
            >
              {t("createAccount")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
