import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { MainNav } from "@/components/layout/main-nav";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MainNav />
      <main className="mx-auto w-full max-w-[72ch] px-4 py-10 md:px-0">{children}</main>
    </div>
  );
}
