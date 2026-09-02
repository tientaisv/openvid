import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { AuthProvider } from "@/app/contexts/useAuth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <AuthProvider>
        <div className="min-h-screen bg-neutral-950 dark">
          {children}
        </div>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
