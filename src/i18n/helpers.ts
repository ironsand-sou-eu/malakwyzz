export async function createComparisonCollator(locale: string) {
  return new Intl.Collator(locale, { ignorePunctuation: true, sensitivity: "base", usage: "search" });
}
