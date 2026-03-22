"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/shared/components/micro/button";
import "./countries-input.css";
import type { CountriesGameKind } from "@/features/countries/countries-interfaces";

type CountriesInputProps = {
  kind: CountriesGameKind;
};

export default function NewGameBlock({ kind }: CountriesInputProps) {
  const t = useTranslations("");

  const handleClickBack = () => {
    window.location.pathname = `/countries/`;
  };

  const handleClickNewGame = () => {
    window.location.pathname = `/countries/${kind}`;
  };

  return (
    <section className="flex flex-row items-center gap-6 text-center sm:text-left">
      <Button type="button" onClick={handleClickBack}>
        {t("back")}
      </Button>
      <Button type="submit" onClick={handleClickNewGame}>
        {t("new-game")}
      </Button>
    </section>
  );
}
