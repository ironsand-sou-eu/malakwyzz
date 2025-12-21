import type { UUID } from "@datastax/astra-db-ts";
import Image from "next/image";
import malakwizzLogo from "@/../public/malakwizz-logo.jpg";
import { getT } from "@/app/(i18n)";
import UnabailableGamePage from "@/app/(shared)/components/macro/unavailable-game-page";
import { isAllowedGameKind } from "@/app/(shared)/functions/typeguards";
import { createCountriesGameInDB } from "@/app/api/newgame/route";
import CountriesGameSection from "./countries-game-section";

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

  const { t } = await getT("countries");

  const localizedKind = t(kind);
  const kindAndYear = kind === "alphabetical" ? localizedKind : `${localizedKind} - ${year}`;

  return (
    <main className="m-auto flex min-h-screen w-full max-w-3xl flex-col items-center py-32 px-16 bg-background dark:bg-foreground sm:items-start">
      <Image className="mx-auto" src={malakwizzLogo} alt="Malakwizz logo" width={150} height={150} priority />
      <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
        {t("guess-me-if-you-can", { kindAndYear })}
      </h1>
      <CountriesGameSection gameId={gameId.toString()} />
    </main>
  );
}
