"use client";

import { useMutation } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/shared/components/micro/button";
import { TextInput } from "@/shared/components/micro/text-input";
import useNotification from "@/shared/hooks/use-notification";
import { useCountriesGuesses } from "./countries-game-provider";
import "./countries-input.css";
import { createComparisonCollator } from "@/i18n/helpers";
import NewGameBlock from "./new-game-block";

type CountriesInputProps = {
  gameId: string;
};

export default function CountriesInput({ gameId }: CountriesInputProps) {
  const notify = useNotification();
  const { guesses, isGameLost, isGameWon, addGuess } = useCountriesGuesses();
  const locale = useLocale();
  const t = useTranslations("");

  const [currentGuess, setCurrentGuess] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Guesses is used as a token for refocus input
  useEffect(() => {
    focusInput();
  }, [guesses]);

  useEffect(() => {
    document.addEventListener("click", focusInput);
    return () => document.removeEventListener("click", focusInput);
  }, [focusInput]);

  const makeGuessMutation = useMutation({
    mutationFn: async () => {
      const resp = await fetch(`/api/countries/makeguess`, {
        body: JSON.stringify({ gameId, guess: currentGuess }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const jsonResp = await resp.json();

      if (!resp.ok) {
        notify.warning(jsonResp.message);
        setTimeout(() => focusInput(), 100);
        return;
      }

      addGuess(jsonResp);
      setCurrentGuess("");
    },
  });

  async function handleSubmit(ev?: FormEvent<HTMLFormElement>) {
    ev?.preventDefault();
    const valid = await isInputValid();
    if (!valid) return;
    makeGuessMutation.mutate();
  }

  async function isInputValid() {
    if (!currentGuess.trim()) return false;
    const collator = await createComparisonCollator(locale);
    if (guesses.some((g) => collator.compare(g.guess.toLowerCase().trim(), currentGuess.toLowerCase().trim()) === 0)) {
      notify.warning(t("guess-already-made"));
      return false;
    }
    return true;
  }

  return isGameWon || isGameLost ? (
    <NewGameBlock />
  ) : (
    <form onSubmit={handleSubmit} className="flex flex-row items-center gap-6 text-center sm:text-left">
      <TextInput
        className="cgp-guess__input"
        value={currentGuess}
        onChange={(ev) => setCurrentGuess(ev.currentTarget.value)}
        disabled={makeGuessMutation.isPending}
        inputRef={inputRef}
        autoFocus
      />
      <Button type="submit" loading={makeGuessMutation.isPending} disabled={makeGuessMutation.isPending}>
        Guess
      </Button>
    </form>
  );
}
