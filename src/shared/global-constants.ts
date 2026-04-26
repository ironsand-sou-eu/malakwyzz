import type { CountriesGameKind } from "@/features/countries/countries-interfaces";

export const MIN_COUNTRIES_PER_GAME = 100;

export const QUERY_STRING_SEARCH_PARAMS = {
  kind: "k",
};

export const GOAL_ASSOCIATED_VALUE = "mlk-goal";

export const suspendedCountriesGameKinds: CountriesGameKind[] = ["hdi", "violence"];

export const COOKIE_KEYS = {
  locale: "MLK_LOC",
};

export const MAX_ATTEMPTS = 8;
