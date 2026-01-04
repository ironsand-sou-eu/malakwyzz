import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";
import classNames from "classnames";
import NavBar from "../shared/components/macro/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MalaKwyzz",
  description: "Are you up to the task?",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { x } = await getBackgroundPositionByIp();
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={classNames(
          geistSans.variable,
          geistMono.variable,
          "antialiased bg-background bg-[url(@/../public/sketch-world-map.png)] bg-cover dark:bg-foreground"
        )}
        style={{ backgroundPositionX: x }}
      >
        <Providers>
          <NavBar />
          {children}
        </Providers>
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
