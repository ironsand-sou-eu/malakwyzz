import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import classNames from "classnames";
import { cookies } from "next/headers";
import { type Locale, NextIntlClientProvider } from "next-intl";
import { COOKIE_KEYS } from "@/shared/global-constants";
import NavBar from "../shared/components/macro/navigation";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  description: "Are you up to the task?",
  title: "MalaKwyzz",
};

async function changeLocaleAction(locale: Locale) {
  "use server";
  const cookiesStore = await cookies();
  cookiesStore.set(COOKIE_KEYS.locale, locale);
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const x = await getBackgroundPositionByIp();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={classNames(geistSans.variable, geistMono.variable, "antialiased bg-background dark:bg-foreground")}
      >
        <NextIntlClientProvider>
          <Providers>
            <div className="m-auto w-full max-w-sm min-w-[344px]">
              <NavBar changeLocaleAction={changeLocaleAction} />
              <main
                className="flex pt-4 pb-9 px-6 flex-col items-center justify-between bg-blend-lighten bg-background bg-[url(@/../public/sketch-world-map.png)] bg-cover dark:bg-foreground"
                style={{
                  // animation: "animatedBackground 500s linear infinite normal",
                  backgroundPositionX: x,
                  minHeight: "calc(100dvh - 40px)",
                }}
              >
                {children}
              </main>
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

async function getBackgroundPositionByIp() {
  const FALLBACK_LONG = 8;
  try {
    const locationResp = await fetch("https://geolocation-db.com/json/");
    const { longitude } = await locationResp.json();
    return convertLongToPercent({ long: longitude });
  } catch (e) {
    console.log("Unable to fetch location", e);
    return convertLongToPercent({ long: FALLBACK_LONG });
  }
}

function convertLongToPercent({ long }: { long: number }) {
  const { initialLong, initialPercent, percentByDegree } = getCalcParametersByLong(long);
  if (!initialLong) return 42;
  const complementX = (initialLong - long) * percentByDegree;
  console.log({ initialLong, initialPercent, long, percentByDegree, x: initialPercent - Math.floor(complementX) });
  return `${initialPercent - Math.floor(complementX)}%`;
}

function getCalcParametersByLong(long: number) {
  if (long <= 140 && long >= -120) {
    return {
      initialLong: 140,
      initialPercent: 113,
      percentByDegree: 0.48,
    };
  }

  if (long <= 180 && long > 140) {
    return {
      initialLong: 180,
      initialPercent: -24,
      percentByDegree: 0.2,
    };
  }

  if (long < -120 && long >= -180) {
    return {
      initialLong: -120,
      initialPercent: -9,
      percentByDegree: 0.2,
    };
  }

  return {
    initialLong: null,
    initialPercent: null,
    percentByDegree: null,
  };
}
