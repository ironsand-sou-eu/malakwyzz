import Image from "next/image";
import { RedirectType, redirect } from "next/navigation";
import malakwizzLogo from "@/../public/malakwizz-logo.jpg";
import { db } from "@/db/db";
import { getT } from "../(i18n)";
import { Button } from "../(shared)/components/micro/button";

export default async function Countries() {
  const { t } = await getT("countries");

  async function fetchGameOptions() {
    try {
      const data = await db.getGameKinds();
      return { hasError: false, data };
    } catch (e) {
      console.log(e);
      return { hasError: true, error: e };
    }
  }

  async function submitHandler(formData: FormData) {
    "use server";
    const kind = formData.get("kind");
    if (kind) redirect(`/countries/${kind}`, RedirectType.push);
  }

  const gameOptionsResp = await fetchGameOptions();
  const gameOptions = gameOptionsResp.data?.map(d => ({ value: d.kind, label: t(d.kind) }));

  return (
    <main className="m-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-background dark:bg-foreground sm:items-start">
      <Image className="mx-auto" src={malakwizzLogo} alt="Malakwizz logo" width={300} height={300} priority />
      <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
        {t("try-your-luck")}
      </h1>
      <div className="flex flex-row items-center gap-6 text-center sm:text-left">
        {gameOptionsResp.hasError || !gameOptions ? (
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            {t("an-error-ocurred")}
          </h1>
        ) : (
          <>
            <h2 className="max-w-xs text-2xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
              {t("order-countries-by")}
            </h2>
            <form className="flex flex-col gap-3" action={submitHandler}>
              <select name="kind" className="p-2 bg-blue-900 rounded-md" defaultValue={gameOptions?.[0].value}>
                {gameOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button type="submit">{t("i-think-im-ready")}</Button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
