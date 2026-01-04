import Image from "next/image";
import { getTranslations } from "next-intl/server";
import malakwizzLogo from "@/../public/malakwizz-logo.png";
import { isAllowedGameKindByYear } from "@/shared/functions/typeguards";
import { Title } from "../micro/titles";

interface UnavailableGamePageProps {
  kind: string;
  year: string;
}
export default async function UnabailableGamePage({ kind, year }: UnavailableGamePageProps) {
  const kindsT = await getTranslations("countries.kinds");
  const generalT = await getTranslations("");

  const localizedKind = kindsT(kind);

  const unavailableMsg = isAllowedGameKindByYear(kind)
    ? generalT("unavailable-game-type-by-year", { localizedKind, year })
    : generalT("unavailable-game-type", { localizedKind });

  return (
    <main className="m-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-background dark:bg-foreground sm:items-start">
      <Image className="mx-auto" src={malakwizzLogo} alt="Malakwizz logo" width={300} height={300} priority />
      <Title>{unavailableMsg}</Title>
    </main>
  );
}
