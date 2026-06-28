import { AuthHeader } from "@/components/auth/auth-header";
import { SiteFooter } from "@/components/auth/site-footer";
import { SignUpForm } from "./sign-up-form";

export function RegisterPage() {
    return (
        <main className="app-gradient-bg relative min-h-screen overflow-hidden text-foreground">
            <AuthHeader mode="register" />

            <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center justify-center px-6 pb-16 pt-2 md:px-10 md:pt-8">
                <SignUpForm />
            </section>
            <SiteFooter />
        </main>
    )
}
