import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { COOKIE_KEYS } from "@/shared/global-constants";

export default getRequestConfig(async (params) => {
  const FALLBACK_LOCALE = "en";
  const cookiesStore = await cookies();
  const locale = params.locale ?? cookiesStore.get(COOKIE_KEYS.locale)?.value ?? FALLBACK_LOCALE;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
