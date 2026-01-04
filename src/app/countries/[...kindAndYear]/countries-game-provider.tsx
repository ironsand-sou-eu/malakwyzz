"use client";

import { createContext, type Dispatch, type PropsWithChildren, type SetStateAction, useContext, useState } from "react";
import type { CountriesGameData } from "@/shared/global-interfaces";

type CountriesContext = {
  guesses: CountriesGameData["guesses"];
  setGuesses: Dispatch<SetStateAction<CountriesGameData["guesses"]>>;
};

// biome-ignore lint/style/noNonNullAssertion: Context setter
const CountriesContext = createContext<CountriesContext>(null!);

export const useCountriesGuesses = () => useContext(CountriesContext);

export default function CountriesGameProvider({ children }: PropsWithChildren) {
  const [guesses, setGuesses] = useState<CountriesGameData["guesses"]>([]);

  return <CountriesContext.Provider value={{ guesses, setGuesses }}>{children}</CountriesContext.Provider>;
}
