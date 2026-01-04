"use client";

import type { ReactNode } from "react";
import { FaChevronDown, FaChevronUp, FaFlagCheckered } from "react-icons/fa";
import type { CountriesGameData } from "@/shared/global-interfaces";
import "./guess-card.css";

const directionIcons: Record<CountriesGameData["guesses"][number]["directionToTarget"], ReactNode> = {
  down: <FaChevronDown alignmentBaseline="middle" />,
  up: <FaChevronUp />,
  win: <FaFlagCheckered />,
};

type GuessCardProps = {
  guess: CountriesGameData["guesses"][number];
};

export default function GuessCard({ guess }: GuessCardProps) {
  const { associatedValue, directionToTarget, distanceToTarget, guess: name } = guess;
  const label = name === associatedValue ? name : `${name} - ${associatedValue}`;

  return (
    <article
      key={guess.associatedValue}
      className="flex flex-row justify-between min-w-full relative border-y-4 border-amber-900 rounded concavity-left-border"
    >
      <div className="flex flex-row items-center gap-1 w-full px-8 py-2.5 bg-orange-300 concavity-left">{label}</div>
      <div className="flex flex-row items-center gap-1 px-4 py-2.5 bg-red-400">
        {directionIcons[directionToTarget]}
        {distanceToTarget !== 0 && <div>{distanceToTarget}</div>}
      </div>
    </article>
  );
}
