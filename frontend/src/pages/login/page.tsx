import { AuthHeader } from "../-components/auth-header";
import { Branding } from "../-components/branding";
import { SignInForm } from "./sign-in-form";

export function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_34%_38%,#e8f5ff_0%,#f7fbff_38%,#ffffff_76%)] text-foreground dark:bg-[radial-gradient(circle_at_34%_38%,rgba(0,86,223,0.32)_0%,rgba(15,23,42,0.98)_42%,#070b16_82%)]">
      <AuthHeader mode="login" />

      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-16 pt-2 md:px-10 md:pt-8 lg:grid-cols-[1.08fr_0.92fr]">
        <Branding />
        <SignInForm />
      </section>
    </main>
  )
}
