export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]">
        {children}
      </div>
    </div>
  );
}
