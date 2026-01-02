import type { UUID } from "@datastax/astra-db-ts";

export interface ApiErrorResponseBody {
  type: string;
  message: string;
}

export type CountriesGameUniverse = {
  countryCode: string;
  countryNames: string[];
  possessionOf: string | null;
  year?: number;
  value?: string | number;
}[];

export type CountriesGameKind = keyof typeof countriesGameKinds;
export type CountriesGameKindByYear = Exclude<keyof typeof countriesGameKinds, "alphabetical" | "landArea">;

export const countriesGameKinds = {
  alphabetical: { name: "alphabetical", applyYears: false },
  gdpPerCapita: { name: "gdpPerCapita", applyYears: true },
  happiness: { name: "happiness", applyYears: true },
  hdi: { name: "hdi", applyYears: true },
  landArea: { name: "landArea", applyYears: false },
  lifeExpectancy: { name: "lifeExpectancy", applyYears: true },
  violence: { name: "violence", applyYears: true },
} as const;

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
