import { suspendedCountriesGameKinds } from "../global-constants";
import { type CountriesGameKind, type CountriesGameKindByYear, countriesGameKinds } from "../global-interfaces";

export function isAllowedGameKind(kind: string | null | undefined): kind is CountriesGameKind {
  if (!kind) return false;
  const availableGameKinds = Object.values(countriesGameKinds).map(({ name }) => name);
  return (
    availableGameKinds.includes(kind as CountriesGameKind) &&
    !suspendedCountriesGameKinds.includes(kind as CountriesGameKind)
  );
}

export function isAllowedGameKindByYear(kind: string | null | undefined): kind is CountriesGameKindByYear {
  if (!kind) return false;
  const availableGameKindsByYear = Object.values(countriesGameKinds)
    .map(({ applyYears, name }) => applyYears && name)
    .filter(v => !!v);
  return (
    availableGameKindsByYear.includes(kind as (typeof availableGameKindsByYear)[number]) &&
    !suspendedCountriesGameKinds.includes(kind as CountriesGameKind)
  );
}
