import Image from "next/image";
import { getTranslations } from "next-intl/server";
import malakwizzLogo from "@/../public/malakwizz-logo.png";
import GameSelectorBlock from "./game-selector-block";

export default async function Countries() {
  const t = await getTranslations();

  return (
    <main
      className="m-auto flex w-full max-w-3xl py-10 px-16 flex-col items-center justify-between bg-background dark:bg-foreground sm:items-start"
      style={{ minHeight: "calc(100dvh - 40px)" }}
    >
      <div>
        <Image className="mx-auto" src={malakwizzLogo} alt="Malakwizz logo" width={300} height={300} priority />
        <h1 className="text-3xl font-semibold tracking-tight mb-2 text-dark-blue dark:text-light-green">
          {t("geo-geeks-gather")}
        </h1>
        <h2 className="font-medium tracking-tight text-dark-blue dark:text-light-green">{t("try-your-luck")}</h2>
      </div>
      <GameSelectorBlock />
    </main>
  );
}
