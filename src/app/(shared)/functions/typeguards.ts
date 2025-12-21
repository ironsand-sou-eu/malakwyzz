import { type CountriesGameKind, countriesGameKinds } from "../global-interfaces";

export function isAllowedGameKind(kind: string): kind is CountriesGameKind {
  return countriesGameKinds.includes(kind as CountriesGameKind);
}
