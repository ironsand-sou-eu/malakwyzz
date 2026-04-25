import type { UUID } from "@datastax/astra-db-ts";

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
  alphabetical: { applyYears: false, name: "alphabetical" },
  gdpPerCapita: { applyYears: true, name: "gdpPerCapita" },
  happiness: { applyYears: true, name: "happiness" },
  hdi: { applyYears: true, name: "hdi" },
  landArea: { applyYears: false, name: "landArea" },
  lifeExpectancy: { applyYears: true, name: "lifeExpectancy" },
  population: { applyYears: false, name: "population" },
  populationDensity: { applyYears: false, name: "populationDensity" },
  violence: { applyYears: true, name: "violence" },
} as const;

export interface CountriesGameData {
  player_id: UUID;
  context: {
    kind: CountriesGameKind;
    year: number;
    gameUniverse: CountriesGameUniverse;
  };
  guesses: {
    associatedValue: string | number;
    directionToTarget: "up" | "down" | "win";
    distanceToTarget: number;
    guess: string;
    guessLabel: string;
    isoCode: string;
    possessionOf: string | null;
    timestamp: string;
    targetName?: string;
    targetAssociatedValue?: string | number;
  }[];
  target: { index: number; value: string };
}
