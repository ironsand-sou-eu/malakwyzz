"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
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
  const { guesses, addGuess } = useCountriesGuesses();
  const t = useTranslations("");

  const [currentGuess, setCurrentGuess] = useState("");

  const makeGuessMutation = useMutation({
    mutationFn: async () => {
      const resp = await fetch(`${BASE_API_URL}/api/countries/makeguess`, {
        body: JSON.stringify({ gameId, guess: currentGuess }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const jsonResp = await resp.json();

      if (!resp.ok) {
        notify.warning(jsonResp.message);
        return;
      }

      addGuess(jsonResp);
      setCurrentGuess("");
    },
  });

  function handleSubmit(ev?: FormEvent) {
    ev?.preventDefault();
    // console.log sanitize "currentGuess"
    if (!isInputValid()) return;
    makeGuessMutation.mutate();
  }

  function isInputValid() {
    if (!currentGuess.trim()) return false;
    if (guesses.some(g => g.guess.toLowerCase().trim() === currentGuess.toLowerCase().trim())) {
      notify.warning(t("guess-already-made"));
      return false;
    }
    return true;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-row items-center gap-6 text-center sm:text-left">
      <TextInput value={currentGuess} onChange={ev => setCurrentGuess(ev.currentTarget.value)} />
      <Button type="submit">Guess</Button>
    </form>
  );
}
