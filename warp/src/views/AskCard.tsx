/** One request, and her answer to your answer, in the same place you tapped. */
import { useState } from "react";
import { useGame } from "../lib/game";
import { Button, Card, Section } from "../lib/ui";
import { grantAsk, refuseAsk, type Ask, type AskReply } from "../engine/asks";
import { SlaveHead } from "./SlaveArt";
import { Reaction } from "./MomentCard";

export default function AskCard({ ask, onDone }: { ask: Ask; onDone?: () => void }) {
  const { save, mutate } = useGame();
  const [reply, setReply] = useState<(AskReply & { how: "yes" | "no" | "harsh" }) | null>(null);
  const who = save.people[ask.person];
  if (!who) return null;

  const answer = (how: "yes" | "no" | "harsh") => {
    let out: AskReply = { what: "", said: "" };
    mutate((s) => {
      const live = s.asks?.find((a) => a.id === ask.id) ?? ask;
      out = how === "yes" ? grantAsk(s, live) : refuseAsk(s, live, how === "harsh");
    });
    setReply({ ...out, how });
  };

  return (
    <Card className="fade-in">
      <div className="flex items-center gap-2.5 mb-2">
        <SlaveHead person={who} size={36} />
        <div className="min-w-0">
          <div className="text-[13.5px]">{who.name}</div>
          <div className="text-[10.5px] uppercase tracking-wider dim">{ask.kind === "instruction" ? "telling you" : "asking"}</div>
        </div>
      </div>
      <p className="font-prose text-[15px] leading-relaxed mb-3">{ask.text}</p>
      {reply ? (
        <div className="space-y-2">
          <div className="player-line !my-1">{reply.how === "yes" ? "You say yes." : reply.how === "no" ? "You say no." : "You put her in her place."}</div>
          {reply.what ? <p className="text-[13px] mid">{reply.what}</p> : null}
          {reply.said ? <p className="said-line fade-in">&ldquo;{reply.said}&rdquo;</p> : null}
          <Reaction seed={{ person: ask.person, title: `${who.name}'s request`, source: "ask", you: `${ask.text}\n\n${reply.how === "yes" ? "You say yes." : reply.how === "no" ? "You say no." : "You put her in her place."}`, happened: [reply.what, reply.said ? `"${reply.said}"` : ""].filter(Boolean).join(" ") }} />
          {onDone ? <Button size="sm" kind="ghost" onClick={onDone}>done</Button> : null}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" kind="primary" onClick={() => answer("yes")}>
            {ask.kind === "instruction" ? "do as she says" : "yes"}{ask.cash ? ` · ¤${ask.cash.toLocaleString()}` : ""}
          </Button>
          <Button size="sm" onClick={() => answer("no")}>no</Button>
          <Button size="sm" kind="danger" onClick={() => answer("harsh")}>put her in her place</Button>
        </div>
      )}
    </Card>
  );
}

/** The week's requests. An answered one stays on screen with her reply until you are done with
 *  it, because the save drops it the moment it is answered. */
export function AskList({ asks, title }: { asks: Ask[]; title?: string }) {
  const [held, setHeld] = useState<Ask[]>(asks);
  const [gone, setGone] = useState<Set<string>>(new Set());
  const ids = new Set(held.map((a) => a.id));
  const fresh = asks.filter((a) => !ids.has(a.id));
  if (fresh.length) setHeld((h) => [...h, ...fresh]);
  const shown = held.filter((a) => !gone.has(a.id));
  if (!shown.length) return null;
  const list = (
    <div className="space-y-3">
      {shown.map((a) => <AskCard key={a.id} ask={a} onDone={() => setGone((g) => new Set(g).add(a.id))} />)}
    </div>
  );
  return title ? <Section title={title}>{list}</Section> : list;
}
