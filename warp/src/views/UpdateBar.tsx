/**
 * A NEWER GAME IS UP. Played from a phone's home screen, the browser keeps the old copy of the game
 * long after a new one is published, so a fix can be live for an hour and the player still not
 * have it. This asks the server for the page itself (never the cache) when the game opens, when it
 * comes back to the front, and every ten minutes, and compares the script it names with the one
 * running. If they differ, a bar offers to reload. Saves live on the device, so nothing is lost.
 */
import { useEffect, useState } from "react";

function running(): string | null {
  const s = Array.from(document.querySelectorAll<HTMLScriptElement>("script[type=module][src]")).find((x) => /assets\/index-[^/]+\.js/.test(x.src));
  return s ? /assets\/index-[^/]+\.js/.exec(s.src)![0] : null;
}

async function published(): Promise<string | null> {
  try {
    const res = await fetch(`./index.html?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) return null;
    return /assets\/index-[^"']+\.js/.exec(await res.text())?.[0] ?? null;
  } catch { return null; }
}

export default function UpdateBar() {
  const [fresh, setFresh] = useState(false);
  useEffect(() => {
    const mine = running();
    // In development there's no built script to compare.
    if (!mine) return;
    const check = async () => { const now = await published(); if (now && now !== mine) setFresh(true); };
    void check();
    const t = window.setInterval(check, 10 * 60_000);
    const back = () => { if (document.visibilityState === "visible") void check(); };
    document.addEventListener("visibilitychange", back);
    return () => { window.clearInterval(t); document.removeEventListener("visibilitychange", back); };
  }, []);
  if (!fresh) return null;
  return (
    <button onClick={() => location.reload()}
      className="fixed left-1/2 -translate-x-1/2 z-[80] btn btn-primary btn-sm shadow-lg"
      style={{ top: "max(10px, env(safe-area-inset-top))" }}>
      New version of the game — tap to reload
    </button>
  );
}
