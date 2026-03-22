
import { Branding } from "../-components/branding";
import { SignUpForm } from "./sign-up-form";

export function RegisterPage() {
    return (
        <div className="grid h-screen grid-cols-2">
            <Branding />
            <SignUpForm />
        </div>
    )
}