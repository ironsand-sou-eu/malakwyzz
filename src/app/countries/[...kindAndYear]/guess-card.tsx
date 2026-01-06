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

const getDistanceColorByHotOrColdLogic = (distance: number): string => {
  if (distance === 0) return "bg-green-500";
  if (distance <= 10) return "bg-red-500";
  if (distance <= 30) return "bg-orange-400";
  if (distance <= 60) return "bg-yellow-400";
  if (distance <= 100) return "bg-blue-400";
  if (distance <= 150) return "bg-blue-900";
  return "bg-purple-600";
};

export default function GuessCard({ guess }: GuessCardProps) {
  const { associatedValue, directionToTarget, distanceToTarget, guess: name } = guess;
  const label = name === associatedValue ? name : `${associatedValue}`;
  const colorClass = getDistanceColorByHotOrColdLogic(distanceToTarget);


  return (
    <article
      key={guess.associatedValue}
      className="flex flex-row justify-between min-w-full relative border-y-4 border-amber-900 rounded concavity-left-border"
    >
      <div className={`flex flex-row items-center gap-1 w-full px-8 py-2.5 bg-orange-300 concavity-left`}>{label}</div>
      <div className={`flex flex-row items-center gap-1 px-4 py-2.5 ${colorClass}`}>
        {directionIcons[directionToTarget]}
        {distanceToTarget !== 0 && <div>{distanceToTarget}</div>}
      </div>
    </article>
  );
}
