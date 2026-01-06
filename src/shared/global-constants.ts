import type { CountriesGameKind } from "./global-interfaces";

export const BASE_API_URL = "http://localhost:3000";

export const MIN_COUNTRIES_PER_GAME = 100;

export const QUERY_STRING_SEARCH_PARAMS = {
  kind: "k",
};

export const GOAL_ASSOCIATED_VALUE = "mlk-goal";

export const suspendedCountriesGameKinds: CountriesGameKind[] = ["hdi", "violence"];
