import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignUp } from "@clerk/nextjs";

export default async function SignUpPage() {
  const { userId } = await auth();
  if (userId) {
    redirect("/upcoming");
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            CareHub
          </h1>
          <p className="mt-1 text-sm text-muted">
            Create an account to get started
          </p>
        </div>
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          fallbackRedirectUrl="/upcoming"
          signInFallbackRedirectUrl="/upcoming"
          appearance={{
            variables: {
              colorPrimary: "oklch(.6 .14 45)",
            },
            elements: {
              card: "shadow-none border border-border rounded-xl",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
            },
          }}
        />
      </div>
    </div>
  );
}
