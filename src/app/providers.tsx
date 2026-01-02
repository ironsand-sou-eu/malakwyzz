"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider } from "next-themes";
import type { PropsWithChildren } from "react";
import en from "@/../messages/en.json";

export function Providers({ children }: PropsWithChildren) {
  const queryClient = new QueryClient();

  return (
    <NextIntlClientProvider locale="en" messages={en}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
}
