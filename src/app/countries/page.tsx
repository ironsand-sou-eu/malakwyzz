import Image from "next/image";
import malakwizzLogo from "@/../public/malakwizz-logo.jpg";
import { ASTRA_KEYSPACES, ASTRA_TABLES, connectToDatabase } from "@/db/db";
import type { CountryMetadataTablePrimaryKey, CountryMetadataTableSchema } from "@/db/migrations/initial-migration";
import { getT } from "../(i18n)";
import Button from "../(shared)/components/micro/button";

export default async function Countries() {
  const { t } = await getT("countries");

  async function fetchGameOptions() {
    try {
      const db = connectToDatabase();
      const data = await db
        .table<CountryMetadataTableSchema, CountryMetadataTablePrimaryKey>(ASTRA_TABLES.countriesMetadata, {
          keyspace: ASTRA_KEYSPACES.countries,
        })
        .find({}, { sort: { kind: 1 }, projection: { kind: true } })
        .toArray();
      return { hasError: false, data };
    } catch (e) {
      console.log(e);
      return { hasError: true, error: e };
    }
  }

  const gameOptionsResp = await fetchGameOptions();
  const gameOptions = gameOptionsResp.data?.map(d => ({ value: d.kind, label: t(d.kind) }));

  return (
    <main className="m-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
      <Image className="mx-auto" src={malakwizzLogo} alt="Malakwizz logo" width={300} height={300} priority />
      <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
        {t("try-your-luck")}
      </h1>
      <div className="flex flex-row items-center gap-6 text-center sm:text-left">
        {gameOptionsResp.hasError || !gameOptions ? (
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            An error ocurred, plyz try again
          </h1>
        ) : (
          <>
            <h2 className="max-w-xs text-2xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
              {t("order-countries-by")}
            </h2>
            <div className="flex flex-col gap-3">
              <select name="kind" className="p-2 bg-blue-900 rounded-md" defaultValue={gameOptions?.[0].value}>
                {gameOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button type="submit">{t("i-think-im-ready")}</Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
