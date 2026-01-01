import Image from "next/image";
import malakwizzLogo from "@/../public/malakwizz-logo.png";
import {
  createCountriesAlphabeticalTable,
  createCountriesGamesCollection,
  createCountriesGdpPerCapitaTable,
  createCountriesHappinessTable,
  createCountriesHdiTable,
  createCountriesLandAreaTable,
  createCountriesLifeExpectancyTable,
  createCountriesMetadataTable,
  seedCountriesAlphabeticalData,
  seedCountriesGdpPerCapitaData,
  seedCountriesHappinessData,
  seedCountriesHdiData,
  seedCountriesLandAreaData,
  seedCountriesLifeExpectancyData,
  seedCountriesMetadata,
} from "@/db/migrations/countries/countries-migration";
import { Button } from "../../shared/components/micro/button";

export default function Dashboard() {
  async function migrate() {
    "use server";

    try {
      await createCountriesAlphabeticalTable();
      await createCountriesGdpPerCapitaTable();
      await createCountriesHappinessTable();
      await createCountriesHdiTable();
      await createCountriesLandAreaTable();
      await createCountriesLifeExpectancyTable();
      await createCountriesMetadataTable();

      await seedCountriesAlphabeticalData();
      await seedCountriesGdpPerCapitaData();
      await seedCountriesHappinessData();
      await seedCountriesHdiData();
      await seedCountriesLandAreaData();
      await seedCountriesLifeExpectancyData();
      await seedCountriesMetadata();

      await createCountriesGamesCollection();
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <main className="m-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-start py-10 px-10 bg-background dark:bg-foreground sm:items-start">
      <Image className="mx-auto" src={malakwizzLogo} alt="Malakwizz logo" width={300} height={300} priority />
      <div className="mx-auto min-w-100 flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
        <h1 className="max-w-xs text-3xl font-semibold text-black dark:text-zinc-50">Dashboard</h1>
        <div className="flex flex-row justify-between items-center w-full">
          <p className="color-background dark:color-foreground">Migration inicial de Countries:</p>
          <form action={migrate}>
            <Button type="submit">Executar</Button>
          </form>
        </div>
      </div>
    </main>
  );
}
