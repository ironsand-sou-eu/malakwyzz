"use client";

import type { ReactNode } from "react";
import { FaChevronDown, FaChevronUp, FaFlagCheckered, FaQuestion } from "react-icons/fa";
import type { CountriesGameData } from "@/shared/global-interfaces";
import "./guess-card.css";
import classNames from "classnames";
import { GOAL_ASSOCIATED_VALUE } from "@/shared/global-constants";

type DirectionsOrGoal = CountriesGameData["guesses"][number]["directionToTarget"] | "goal";
const directionIcons: Record<DirectionsOrGoal, ReactNode> = {
  down: <FaChevronDown alignmentBaseline="middle" />,
  goal: <FaQuestion />,
  up: <FaChevronUp />,
  win: <FaFlagCheckered />,
};

type GuessCardProps = {
  guess: CountriesGameData["guesses"][number];
};

export default function GuessCard({ guess }: GuessCardProps) {
  const { associatedValue, directionToTarget, distanceToTarget, guess: name } = guess;
  const isGoalCard = associatedValue === GOAL_ASSOCIATED_VALUE;
  const label = generateCardLabel();

  function generateCardLabel() {
    if (isGoalCard) return name;
    if (typeof associatedValue === "string" && name.trim().toLowerCase() === associatedValue.trim().toLowerCase()) {
      return name;
    }
    return `${name} - ${associatedValue}`;
  }

  const directionToTargetOrGoal = isGoalCard ? "goal" : directionToTarget;

  return (
    <article
      key={guess.associatedValue}
      className={classNames(
        "flex flex-row justify-between min-w-full relative border-y-4 border-amber-900 rounded concavity-left-border sepia-40",
        { "grayscale-50": isGoalCard, "opacity-50": isGoalCard }
      )}
    >
      <div className="flex flex-row items-center gap-1 w-full px-8 py-2.5 bg-orange-300 concavity-left">{label}</div>
      <div className="flex flex-row items-center gap-1 px-4 py-2.5 bg-red-400">
        {directionIcons[directionToTargetOrGoal]}
        {distanceToTarget !== 0 && <div>{distanceToTarget}</div>}
      </div>
    </article>
  );
}
