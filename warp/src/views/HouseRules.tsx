/**
 * THE HOUSE RULES, on screen: what your slaves may do with each other and with themselves, the
 * way the original set release, consent and relationships for the whole house. See engine/houserules.
 */
import { useGame } from "../lib/game";
import { Card, Chip, Section } from "../lib/ui";
import { RULE_LABEL, rulesOf, type SlaveRules } from "../engine/houserules";

const GROUPS: { key: keyof SlaveRules; title: string; note: string }[] = [
  { key: "between", title: "Events between your slaves", note: "What goes on between them that you hear about: the household's week, the disputes they bring you, and the goings-on written each week. Off, nothing between them comes to you." },
  { key: "release", title: "Release", note: "Who she may get off with. A slave allowed to see to herself, or to the other girls, isn't left wound up all week waiting on you." },
  { key: "consent", title: "Consent between slaves", note: "Whether one of your slaves may take another who doesn't want it. Only matters when they may fuck each other." },
  { key: "relationships", title: "Relationships between slaves", note: "What they may be to each other. Lovers need release with each other too." },
];

export function HouseRulesPanel() {
  const { save, mutate } = useGame();
  const r = rulesOf(save);
  const set = <K extends keyof SlaveRules>(k: K, v: SlaveRules[K]) => mutate((s) => { rulesOf(s)[k] = v; });
  const sexOff = r.between === "sexual" && r.release !== "slaves";
  return (
    <Section title="House rules">
      <div className="grid gap-2.5">
        {GROUPS.map((g) => {
          const labels = RULE_LABEL[g.key] as Record<string, string>;
          const dim = g.key === "consent" && r.release !== "slaves";
          return (
            <Card key={g.key} className={dim ? "opacity-60" : undefined}>
              <div className="text-[13.5px] font-medium mb-1">{g.title}</div>
              <p className="text-[12px] dim mb-2.5">{g.note}</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(labels).map(([v, label]) => (
                  <Chip key={v} on={r[g.key] === v} tone={g.key === "consent" && v === "not_required" ? "bad" : undefined} onClick={() => set(g.key, v as SlaveRules[typeof g.key])}>{label}</Chip>
                ))}
              </div>
              {g.key === "between" && sexOff ? <p className="text-[12px] mt-2 warn">Release is set so they may not fuck each other, so nothing sexual between them comes up until release allows it.</p> : null}
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
