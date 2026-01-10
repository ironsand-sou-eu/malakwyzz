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
  const { x } = await getBackgroundPositionByIp();
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
                className="flex py-10 px-6 flex-col items-center justify-between bg-blend-lighten bg-background bg-[url(@/../public/sketch-world-map.png)] bg-cover dark:bg-foreground"
                style={{ backgroundPositionX: x, minHeight: "calc(100dvh - 40px)" }}
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
  const FALLBACK_LAT = 40;
  const FALLBACK_LONG = 0;
  try {
    const locationResp = await fetch("https://geolocation-db.com/json/");
    const { latitude, longitude } = await locationResp.json();
    return convertLatLongToPercent({ lat: latitude, long: longitude });
  } catch (e) {
    console.log("Unable to fetch location", e);
    return convertLatLongToPercent({ lat: FALLBACK_LAT, long: FALLBACK_LONG });
  }
}

function convertLatLongToPercent({ lat, long }: { lat: number; long: number }) {
  const HEMISPHERE_LONGITUDE_DEGREES = 180;
  const HEMISPHERE_LATITUDE_DEGREES = 90;
  const decimalY = (long / HEMISPHERE_LONGITUDE_DEGREES) * 100;
  const y = `${Math.floor(decimalY)}%`;
  const decimalX = (lat / HEMISPHERE_LATITUDE_DEGREES) * 100;
  const x = `${Math.floor(decimalX)}%`;

  return { x, y };
}
