"use client";

import { useMutation } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { Button } from "@/shared/components/micro/button";
import { TextInput } from "@/shared/components/micro/text-input";
import { BASE_API_URL } from "@/shared/global-constants";
import useNotification from "@/shared/hooks/use-notification";
import { useCountriesGuesses } from "./countries-game-provider";

type CountriesInputProps = {
  gameId: string;
};

export default function CountriesInput({ gameId }: CountriesInputProps) {
  const notify = useNotification();
  const { setGuesses } = useCountriesGuesses();

  const [currentGuess, setCurrentGuess] = useState("");

  const makeGuessMutation = useMutation({
    mutationFn: async () => {
      const resp = await fetch(`${BASE_API_URL}/api/countries/makeguess`, {
        body: JSON.stringify({ gameId, guess: currentGuess }),
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const jsonResp = await resp.json();

      if (resp.ok) {
        setGuesses(prevValues => {
          const allValues = [...prevValues, jsonResp];
          if (!Number.isNaN(Number(jsonResp.associatedValue))) {
            return allValues.toSorted((a, b) => b.associatedValue - a.associatedValue);
          }

          const collator = new Intl.Collator("en", { sensitivity: "base" }); //console.log set to correct locale
          return allValues.sort(sortByAssociatedValueAlphabetically(collator));
        });
        setCurrentGuess("");
        return;
      }

      notify.warning(jsonResp.message);
      return;
    },
  });

  const sortByAssociatedValueAlphabetically =
    (collator: Intl.Collator) => (a: { associatedValue: string }, b: { associatedValue: string }) => {
      return collator.compare(a.associatedValue, b.associatedValue);
    };

  function handleSubmit(ev?: FormEvent) {
    ev?.preventDefault();
    // console.log sanitize "currentGuess"
    // console.log Verify if "currentGuess" isn't already in guess list
    // console.log Verify if "currentGuess" isn't empty
    makeGuessMutation.mutate();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-row items-center gap-6 text-center sm:text-left">
      <TextInput value={currentGuess} onChange={ev => setCurrentGuess(ev.currentTarget.value)} />
      <Button type="submit">Guess</Button>
    </form>
  );
}
