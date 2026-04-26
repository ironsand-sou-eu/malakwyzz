import CountriesGamePage from "@/features/countries/game/countries-game-page";

export default async function CountriesGame({ params, searchParams }: PageProps<"/countries/[...kindAndYear]">) {
  return <CountriesGamePage params={params} searchParams={searchParams} />;
}
