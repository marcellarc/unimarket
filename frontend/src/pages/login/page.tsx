import { Branding } from "../-components/branding";
import { SignInForm } from "./sign-in-form";

export function LoginPage() {
  return (
    <div className="grid h-screen grid-cols-2">
      <Branding />
      <SignInForm />
    </div>
  )
}