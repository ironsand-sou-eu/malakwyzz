import type { UUID } from "@datastax/astra-db-ts";

export interface ApiErrorResponseBody {
  type: string;
  message: string;
}

export type CountriesGameUniverse = {
  country: string;
  value: string;
}[];

export type CountriesGameKind = (typeof countriesGameKinds)[number];

export const countriesGameKinds = [
  "alphabetical",
  "gdp_per_capita",
  "happyness",
  "hdi",
  "land_area",
  "life_expectancy",
  "violence",
] as const;

export interface CountriesGameData {
  player_id: UUID;
  context: {
    kind: CountriesGameKind;
    year: number;
    gameUniverse: CountriesGameUniverse;
  };
  guesses: {
    guess: string;
    associatedValue: string | number;
    directionToTarget: "up" | "down" | "win";
    distanceToTarget: number;
    timestamp: string;
  }[];
  target: { index: number; value: string };
}
