import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-600 via-rose-500 to-amber-400 p-4">
      <SignIn />
    </main>
  );
}
