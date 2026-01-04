"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/micro/button";
import { Title } from "@/shared/components/micro/titles";
import { isAllowedGameKindByYear } from "@/shared/functions/typeguards";
import { BASE_API_URL } from "../../shared/global-constants";
import type { CountriesGameKind } from "../../shared/global-interfaces";
import useNotification from "../../shared/hooks/use-notification";

interface GameKind {
  kind: CountriesGameKind;
  label: string;
  applyYears: boolean;
}

function useCountriesGameKinds() {
  return useQuery({
    queryKey: ["countriesGameKinds"],
    queryFn: async (): Promise<GameKind[]> => {
      const response = await fetch(`${BASE_API_URL}/api/countries/availablekinds`);
      const json = await response.json();
      return json.data;
    },
  });
}

function useAvailableYears(kind: CountriesGameKind) {
  return useQuery({
    queryKey: ["availableYears", kind],
    queryFn: async (): Promise<number[] | null> => {
      if (!isAllowedGameKindByYear(kind)) return null;
      const response = await fetch(`${BASE_API_URL}/api/countries/availableyears?k=${kind}`);
      const json = await response.json();
      return json.data;
    },
  });
}

export default function GameSelectorBlock() {
  const notify = useNotification();
  const t = useTranslations();

  const { data: kinds, error: kindError } = useCountriesGameKinds();

  const [selectedYear, setSelectedYear] = useState<number>();
  const [selectedKind, setSelectedKind] = useState<GameKind>();

  const { data: years, error } = useAvailableYears(selectedKind?.kind ?? "alphabetical");

  useEffect(() => {
    if (kinds) setSelectedKind(kinds[0]);
  }, [kinds]);

  useEffect(() => {
    if (years) setSelectedYear(years[0]);
    else setSelectedYear(undefined);
  }, [years]);

  useEffect(() => {
    if (error) notify.error(error.message);
  }, [notify.error, error]);

  return kindError ? (
    <Title>{t("an-error-ocurred")}</Title>
  ) : (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-4 text-center sm:text-left">
        <h2 className="max-w-xs text-2xl font-semibold leading-10 tracking-tight text-dark-blue dark:text-light-green">
          {t("order-by")}
        </h2>
        <select
          name="kind"
          className="p-2 rounded-md capitalize text-dark-blue dark:text-light-green min-w-36"
          value={selectedKind?.kind}
          onChange={ev => setSelectedKind(kinds?.find(k => k.kind === ev.currentTarget.value))}
        >
          {kinds?.map(kind => (
            <option className="capitalize" key={kind.kind} value={kind.kind}>
              {kind.label}
            </option>
          ))}
        </select>
        {years?.length && (
          <select
            name="year"
            className="p-2 rounded-md capitalize text-dark-blue dark:text-light-green min-w-20"
            value={selectedYear}
            onChange={ev => setSelectedYear(parseInt(ev.currentTarget.value, 10))}
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        )}
      </div>
      <Button
        type="button"
        disabled={!selectedKind || (selectedKind.applyYears && !selectedYear)}
        onClick={() => {
          if (!selectedKind) return;
          if (!selectedKind.applyYears) window.location.pathname = `/countries/${selectedKind.kind}`;
          if (selectedKind.applyYears && selectedYear) {
            window.location.pathname = `/countries/${selectedKind.kind}/${selectedYear}`;
          }
        }}
      >
        {t("i-think-im-ready")}
      </Button>
    </section>
  );
}
