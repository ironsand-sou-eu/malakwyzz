"use client";

import { useCountriesGuesses } from "./countries-game-provider";
import GuessCard from "./guess-card";

export default function CountriesGuessesList() {
  const { guesses } = useCountriesGuesses();
  return (
    <section className="flex flex-col items-center text-center sm:text-left h-full min-w-full">
      {guesses.map(guess => (
        <GuessCard key={guess.timestamp} guess={guess} />
      ))}
    </section>
  );
}
