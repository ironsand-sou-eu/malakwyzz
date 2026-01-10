import Image from "next/image";
import { getTranslations } from "next-intl/server";
import malakwizzLogo from "@/../public/malakwizz-logo.png";
import { Subtitle, Title } from "@/shared/components/micro/titles";
import GameSelectorBlock from "./game-selector-block";

export default async function Countries() {
  const t = await getTranslations();

  return (
    <>
      <div>
        <Image className="mx-auto" src={malakwizzLogo} alt="Malakwizz logo" width={300} height={300} priority />
        <Title>{t("geo-geeks-gather")}</Title>
        <Subtitle>{t("try-your-luck")}</Subtitle>
      </div>
      <GameSelectorBlock />
    </>
  );
}
