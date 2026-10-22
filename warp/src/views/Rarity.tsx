/** What's unusual about how she looks, as chips: the rare things first, and how rare. */
import type { Person } from "../engine/types";
import { featuresOf, FEATURES, RARITY_WORD, rarityOf } from "../engine/features";
import { Chip } from "../lib/ui";

export default function RarityChips({ p, all = false }: { p: Person; all?: boolean }) {
  const fs = featuresOf(p).filter((f) => all || FEATURES[f.id].rarity >= 2).sort((a, b) => FEATURES[b.id].rarity - FEATURES[a.id].rarity);
  if (!fs.length) return null;
  const top = rarityOf(p);
  return (
    <>
      {top >= 3 ? <Chip tone="good">{RARITY_WORD[top]}</Chip> : null}
      {fs.map((f) => <Chip key={f.id} on={FEATURES[f.id].rarity >= 3}>{FEATURES[f.id].label}</Chip>)}
    </>
  );
}
