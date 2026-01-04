import type { UUID } from "@datastax/astra-db-ts";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import malakwizzLogo from "@/../public/malakwizz-logo.png";
import { createCountriesGameInDB } from "@/app/api/countries/newgame/route";
import UnabailableGamePage from "@/shared/components/macro/unavailable-game-page";
import { Subtitle, Title } from "@/shared/components/micro/titles";
import { isAllowedGameKind } from "@/shared/functions/typeguards";
import CountriesGameProvider from "./countries-game-provider";
import CountriesGuessesList from "./countries-guesses-list";
import CountriesInput from "./countries-input";

const USER_ID = "a4ae381b-4759-7fb2-8d69-afc96ccb4593" as unknown as UUID; //console.log: make dynamic

export default async function CountriesGame({ params }: PageProps<"/countries/[...kindAndYear]">) {
  const {
    kindAndYear: [kind, year],
  } = await params;

  if (!isAllowedGameKind(kind)) return <UnabailableGamePage kind={kind} year={year} />;

  let gameId: UUID | null = null;

  try {
    gameId = await createCountriesGameInDB({
      kind,
      userId: USER_ID,
      year: Number.parseInt(year, 10),
    });
  } catch (e) {
    console.error(e);
  }

  if (!gameId) return <UnabailableGamePage kind={kind} year={year} />;

  const tKind = await getTranslations("countries.kinds");
  const tGeneral = await getTranslations("");

  const localizedKind = tKind(kind);
  const kindAndYear = kind === "alphabetical" ? localizedKind : `${localizedKind} - ${year}`;

  return (
    <main
      className="m-auto flex w-full max-w-3xl py-10 px-6 flex-col items-center justify-between bg-background dark:bg-foreground sm:items-start"
      style={{ minHeight: "calc(100dvh - 40px)" }}
    >
      <div>
        <Image className="mx-auto" src={malakwizzLogo} alt="Malakwizz logo" width={150} height={150} priority />
        <Title>{tGeneral("guess-me-if-you-can", { kindAndYear })}</Title>
        <Subtitle>{tGeneral("ordered-by", { kindAndYear })}</Subtitle>
      </div>
      <CountriesGameProvider>
        <CountriesGuessesList />
        <CountriesInput gameId={gameId.toString()} />
      </CountriesGameProvider>
    </main>
  );
}
