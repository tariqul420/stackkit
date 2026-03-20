import LoginForm from "@/features/auth/components/login-form";

export default function Login({
  searchParams,
}: {
  searchParams?: { redirect?: string };
}) {
  return <LoginForm searchParams={searchParams} />;
}
