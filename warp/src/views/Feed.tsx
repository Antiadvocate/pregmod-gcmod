/**
 * THE FEED, ON SCREEN — the city's message boards, one scroll.
 *
 * Posts arrive in the background (FeedTicker, mounted once by the shell) from a cheap model on a
 * pace you set. Each is a card: board, author, title, a few lines, and the things it grew from.
 * Tapping opens it; "Tell the whole story" hands it to the narrator. An upvote tells the writer
 * what you want more of.
 */
import { useEffect, useRef, useState } from "react";
import { ArrowBigUp, Loader2, MessageSquare, RefreshCw, Sparkles } from "lucide-react";
import { useGame } from "../lib/game";
import { Button, Empty, Sheet, cx } from "../lib/ui";
import { call } from "../llm";
import { modelsAvailable } from "../config";
import type { SaveState } from "../engine/types";
import { BOARDS, feedOf, likePost, sources, storyPrompt, writePosts, type Post, type Writer } from "../engine/feed";

export const feedModel = (s: SaveState) => s.models.feed_model || s.models.bookkeeper_model;
export const feedPace = (s: SaveState) => s.models.feed_pace ?? 5;

const writerFor = (s: SaveState): Writer => async (system, user) => {
  const r = await call({ system, user, model: feedModel(s), fallback: s.models.fallback_model, json: true, maxTokens: 2200, temperature: 1.05 });
  return { ok: r.ok, text: r.text, error: r.error };
};

/**
 * THE BACKGROUND WRITER. Checks every fifteen seconds; writes a batch when the pace says one is due,
 * the tab is in front of you, a model is set, and lean mode is off. One batch at a time.
 */
export function FeedTicker() {
  const { save, mutate } = useGame();
  const busy = useRef(false);
  useEffect(() => {
    const tick = async () => {
      const pace = feedPace(save);
      if (busy.current || !pace || save.models.lean_mode || !modelsAvailable() || document.visibilityState !== "visible") return;
      const f = feedOf(save);
      if (f.last && Date.now() - f.last < pace * 60_000) return;
      busy.current = true;
      try { await writePosts(save, writerFor(save)); } finally { busy.current = false; }
      mutate(() => {});
    };
    const id = window.setInterval(() => void tick(), 15_000);
    void tick();
    return () => window.clearInterval(id);
  }, [save, mutate]);
  return null;
}

const ago = (at: number) => {
  const m = Math.round((Date.now() - at) / 60_000);
  return m < 1 ? "just now" : m < 60 ? `${m}m` : m < 1440 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d`;
};

const KIND_TONE: Record<Post["kind"], string> = { citizen: "var(--text-mid)", slave: "#d58bb0", visitor: "#8fb2de", official: "var(--accent)", business: "var(--good)" };

export default function Feed() {
  const { save, mutate } = useGame();
  const f = feedOf(save);
  const [board, setBoard] = useState<string>("all");
  const [open, setOpen] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // Opening the feed reads it.
  useEffect(() => { if (f.seen !== f.posts.length) mutate((s) => { feedOf(s).seen = feedOf(s).posts.length; }); }, [f.posts.length]);

  const now = async () => {
    if (busy) return;
    setBusy(true); setErr("");
    const r = await writePosts(save, writerFor(save));
    mutate(() => {});
    setBusy(false);
    if (!r.ok) setErr(r.error ?? "Nothing came back. Try again.");
  };

  const boards = BOARDS.filter((b) => f.posts.some((p) => p.board === b));
  const shown = f.posts.filter((p) => board === "all" || p.board === board);
  const post = open ? f.posts.find((p) => p.id === open) : undefined;
  const pace = feedPace(save);

  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <div className="text-[12px] dim flex-1 min-w-0">
          {!modelsAvailable() ? "The feed needs a model (Settings)."
            : save.models.lean_mode ? "Lean mode is on: new posts only when you ask."
            : pace ? `New posts every ${pace} min while the game is open.` : "Background posts are off (Settings)."}
        </div>
        <Button size="sm" kind="ghost" disabled={busy || !modelsAvailable()} onClick={() => void now()}>
          {busy ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} new posts
        </Button>
      </div>
      {err ? <div className="text-[12px] bad mb-2">{err}</div> : null}

      {boards.length > 1 ? (
        <div className="segmented no-scrollbar mb-3">
          {["all", ...boards].map((b) => (
            <button key={b} className={cx("seg", board === b && "on")} onClick={() => setBoard(b)}>{b === "all" ? "All" : b}</button>
          ))}
        </div>
      ) : null}

      {!shown.length ? (
        <Empty>{f.posts.length ? "Nothing on this board yet." : "No posts yet. The city starts talking once a model is set; tap “new posts” to start it now."}</Empty>
      ) : (
        <div className="space-y-2.5">
          {shown.map((p) => <PostCard key={p.id} p={p} onOpen={() => setOpen(p.id)} onLike={() => mutate((s) => likePost(s, p.id))} />)}
        </div>
      )}

      <Sheet open={!!post} onClose={() => setOpen(null)} title={post?.board ?? ""} wide>
        {post ? <PostOpen p={post} /> : null}
      </Sheet>
    </>
  );
}

function PostCard({ p, onOpen, onLike }: { p: Post; onOpen: () => void; onLike: () => void }) {
  const { save } = useGame();
  const labels = sourceLabels(save, p);
  return (
    <article className="card p-3.5 press cursor-pointer" onClick={onOpen}>
      <div className="flex items-center gap-1.5 text-[11.5px] mb-1">
        <span className="font-medium">{p.board}</span>
        <span className="dim">·</span>
        <span style={{ color: KIND_TONE[p.kind] }}>u/{p.author}</span>
        <span className="dim ml-auto">{ago(p.at)}</span>
      </div>
      <h3 className="text-[15px] font-semibold leading-snug mb-1">{p.title}</h3>
      <p className="text-[13.5px] mid leading-relaxed clamp-3">{p.body}</p>
      {p.replies?.[0] ? (
        <div className="mt-2 pl-2.5 text-[12.5px] leading-snug truncate" style={{ borderLeft: "2px solid var(--line-strong)" }}>
          <span className="dim">{p.replies[0].author}</span> <span className="mid">{p.replies[0].text}</span>
        </div>
      ) : null}
      <div className="flex items-center gap-3 mt-2.5 text-[12px] dim">
        <button className={cx("flex items-center gap-1", p.liked && "acc")} onClick={(e) => { e.stopPropagation(); onLike(); }} aria-label="upvote">
          <ArrowBigUp size={16} fill={p.liked ? "currentColor" : "none"} /> {p.score}
        </button>
        <span className="flex items-center gap-1"><MessageSquare size={13} /> {p.comments}</span>
        {p.story ? <span className="flex items-center gap-1 acc"><Sparkles size={12} /> story</span> : null}
        <span className="ml-auto truncate max-w-[55%] text-right">{labels.join(" · ")}</span>
      </div>
    </article>
  );
}

function sourceLabels(s: SaveState, p: Post): string[] {
  const src = sources(s);
  return p.draws.map((id) => src.find((x) => x.id === id)?.label).filter((x): x is string => !!x);
}

function PostOpen({ p }: { p: Post }) {
  const { save, mutate } = useGame();
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const stop = useRef<AbortController | null>(null);
  const tell = async () => {
    if (busy) return;
    setBusy(" "); setErr("");
    const ctl = new AbortController();
    stop.current = ctl;
    let acc = "";
    const { system, user } = storyPrompt(save, p);
    const r = await call({ system, user, model: save.models.narrator_model, fallback: save.models.fallback_model, maxTokens: 2200, temperature: 0.9, signal: ctl.signal,
      onDelta: (d) => { acc += d; setBusy(acc); }, onReset: () => { acc = ""; setBusy(" "); } });
    if (r.ok && r.text.trim()) mutate((s) => { const q = feedOf(s).posts.find((x) => x.id === p.id); if (q) q.story = { text: r.text.trim(), model: r.model }; });
    else if (!ctl.signal.aborted) setErr(r.error ?? "The narrator returned nothing.");
    setBusy("");
  };
  const text = busy.trim() ? busy : p.story?.text;
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[11.5px] mb-1.5">
        <span style={{ color: KIND_TONE[p.kind] }}>u/{p.author}</span>
        <span className="dim">· {p.kind} · week {p.week}</span>
      </div>
      <h2 className="text-[18px] font-semibold leading-snug mb-2">{p.title}</h2>
      <p className="text-[14px] mid leading-relaxed">{p.body}</p>
      {p.replies?.length ? (
        <div className="mt-3 space-y-2">
          {p.replies.map((q, i) => (
            <div key={i} className="pl-3 text-[13px] leading-snug" style={{ borderLeft: "2px solid var(--line-strong)" }}>
              <div className="text-[11.5px] dim mb-0.5">u/{q.author}</div>
              <div className="mid">{q.text}</div>
            </div>
          ))}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {sourceLabels(save, p).map((l) => <span key={l} className="chip">{l}</span>)}
      </div>

      <div className="hairline-top mt-4 pt-4">
        {text ? (
          <div className="space-y-3">
            {text.split(/\n\n+/).map((para, i) => <p key={i} className="font-prose text-[15.5px] leading-relaxed" style={{ color: "#e6dfd1" }}>{para}</p>)}
          </div>
        ) : null}
        {err ? <div className="text-[12px] bad mt-2">{err}</div> : null}
        <div className="flex gap-2 mt-3">
          {busy ? (
            <button className="btn btn-sm btn-danger" onClick={() => stop.current?.abort()}>stop</button>
          ) : (
            <Button size="sm" kind={p.story ? "ghost" : "primary"} disabled={!modelsAvailable()} onClick={() => void tell()}>
              <Sparkles size={13} /> {p.story ? "tell it again" : "Tell the whole story"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
