import Image from "next/image";
import { getTranslations } from "next-intl/server";
import malakwizzLogo from "@/../public/malakwizz-logo.png";

interface UnavailableGamePageProps {
  kind: string;
  year: string;
}
export default async function UnabailableGamePage({ kind, year }: UnavailableGamePageProps) {
  const t = await getTranslations("countries.kinds");
  const localizedKind = t(kind);

  return (
    <main className="m-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-background dark:bg-foreground sm:items-start">
      <Image className="mx-auto" src={malakwizzLogo} alt="Malakwizz logo" width={300} height={300} priority />
      <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
        {t("unavailable-game-type", { localizedKind, year })}
      </h1>
    </main>
  );
}
