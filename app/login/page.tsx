import { AuthForm } from "@/components/AuthForm";

export const metadata = {
  title: "Log in · NeuroUI",
};

export default function LoginPage() {
  return <AuthForm mode="signin" />;
}
