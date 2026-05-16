import { AuthHeader } from "../-components/auth-header";
import { Branding } from "../-components/branding";
import { SiteFooter } from "../-components/site-footer";
import { SignInForm } from "./sign-in-form";

export function LoginPage() {
  return (
    <main className="app-gradient-bg relative min-h-screen overflow-hidden text-foreground">
      <AuthHeader mode="login" />

      <section className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-16 pt-2 md:px-10 md:pt-8 lg:grid-cols-[1.08fr_0.92fr]">
        <Branding />
        <SignInForm />
      </section>
      <SiteFooter />
    </main>
  )
}
