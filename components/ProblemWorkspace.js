"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Play, RotateCcw, Send, Settings2, TextCursorInput, WandSparkles } from "lucide-react";
import { GENERIC_TEMPLATES, LANGUAGES, LANG_KEYS } from "@/lib/languages";
import ResultPanel from "@/components/ResultPanel";

const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false, loading: () => <div className="skeleton m-3 h-[calc(100%-1.5rem)]" /> });
const DEFAULT_PREFS = { fontSize: 14, tabSize: 4, wordWrap: "off", minimap: false };
const btn = "inline-flex h-8 items-center gap-1.5 rounded-md border border-line px-2.5 text-xs transition-colors hover:bg-raised disabled:opacity-50";

export default function ProblemWorkspace({ slug, snippets, drafts, exampleInput, loggedIn, children }) {
  const router = useRouter();
  const [pane, setPane] = useState("desc");
  const [lang, setLang] = useState("javascript");
  const [codes, setCodes] = useState({});
  const [stdin, setStdin] = useState("");
  const [busy, setBusy] = useState(null);
  const [result, setResult] = useState(null);
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [showPrefs, setShowPrefs] = useState(false);
  const editorRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    try {
      const l = localStorage.getItem("lang"); if (LANG_KEYS.includes(l)) setLang(l);
      const p = JSON.parse(localStorage.getItem("editorPrefs") || "null"); if (p) setPrefs({ ...DEFAULT_PREFS, ...p });
    } catch {}
  }, []);

  const starter = (l) => snippets[l] ?? GENERIC_TEMPLATES[l];
  const code = codes[lang] ?? drafts[lang] ?? starter(lang);
  const official = !!snippets[lang];

  function changeCode(v) {
    const value = v ?? "";
    setCodes((c) => ({ ...c, [lang]: value }));
    if (!loggedIn) return;
    clearTimeout(timer.current);
    const l = lang;
    timer.current = setTimeout(() => {
      fetch(`/api/progress/${slug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ language: l, code: value }) }).catch(() => {});
    }, 1500);
  }
  function changeLang(l) { setLang(l); try { localStorage.setItem("lang", l); } catch {} setResult(null); }
  function savePrefs(next) { setPrefs(next); try { localStorage.setItem("editorPrefs", JSON.stringify(next)); } catch {} }

  async function reset() {
    if (!window.confirm("Reset to the starter code? Your current code for this language will be discarded.")) return;
    setCodes((c) => ({ ...c, [lang]: starter(lang) }));
    if (loggedIn) fetch(`/api/progress/${slug}?language=${lang}`, { method: "DELETE" }).catch(() => {});
    toast.success("Code reset");
  }
  function format() {
    const action = lang === "javascript" ? editorRef.current?.getAction("editor.action.formatDocument") : null;
    if (action) action.run(); else toast(`Formatting is only available for JavaScript in the browser editor.`);
  }

  async function send(mode) {
    if (!loggedIn) { toast("Log in to run or submit code."); return router.push(`/login?next=${encodeURIComponent(location.pathname)}`); }
    setBusy(mode); setResult(null);
    try {
      const res = await fetch(mode === "run" ? "/api/execute" : "/api/submissions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "run" ? { slug, language: lang, code, stdin } : { slug, language: lang, code }),
      });
      const data = await res.json().catch(() => ({}));
      setResult(res.ok ? { type: mode, ...data } : { type: "error", message: data.error || "Request failed.", code: data.code });
      if (res.ok && mode === "submit" && data.status === "Accepted") toast.success("Accepted");
    } catch {
      setResult({ type: "error", message: "Network error. Check your connection and try again." });
    }
    setBusy(null);
  }

  const tab = (id, label) => (
    <button onClick={() => setPane(id)} aria-pressed={pane === id} className={`flex-1 py-2 text-sm ${pane === id ? "border-b-2 border-accent text-fg" : "text-muted"}`}>{label}</button>
  );
  return (
    <div className="flex flex-1 flex-col lg:h-[calc(100vh-6.5rem)]">
      <div className="flex border-b border-line lg:hidden">{tab("desc", "Description")}{tab("code", "Code")}</div>
      <div className="grid flex-1 gap-0 lg:min-h-0 lg:grid-cols-2">
        <section className={`${pane === "desc" ? "block" : "hidden"} overflow-y-auto border-r border-line lg:block`} aria-label="Problem description">{children}</section>

        <section className={`${pane === "code" ? "flex" : "hidden"} min-h-[85vh] flex-col lg:flex lg:min-h-0`} aria-label="Code editor">
          <div className="flex flex-wrap items-center gap-2 border-b border-line p-2">
            <select aria-label="Language" value={lang} onChange={(e) => changeLang(e.target.value)} className="h-8 rounded-md border border-line bg-surface px-2 text-xs">
              {LANG_KEYS.map((k) => <option key={k} value={k}>{LANGUAGES[k].label}</option>)}
            </select>
            <button className={btn} onClick={format}><WandSparkles size={13} />Format</button>
            <button className={btn} onClick={reset}><RotateCcw size={13} />Reset</button>
            <div className="relative">
              <button className={btn} onClick={() => setShowPrefs(!showPrefs)} aria-expanded={showPrefs}><Settings2 size={13} />Editor</button>
              {showPrefs && (
                <div className="absolute left-0 z-20 mt-1 w-56 space-y-3 rounded-lg border border-line bg-surface p-3 text-xs shadow-lg">
                  <label className="flex items-center justify-between">Font size
                    <select value={prefs.fontSize} onChange={(e) => savePrefs({ ...prefs, fontSize: +e.target.value })} className="rounded border border-line bg-bg px-1 py-1">{[12, 13, 14, 16, 18, 20].map((n) => <option key={n}>{n}</option>)}</select></label>
                  <label className="flex items-center justify-between">Tab size
                    <select value={prefs.tabSize} onChange={(e) => savePrefs({ ...prefs, tabSize: +e.target.value })} className="rounded border border-line bg-bg px-1 py-1"><option>2</option><option>4</option></select></label>
                  <label className="flex items-center justify-between">Word wrap
                    <input type="checkbox" checked={prefs.wordWrap === "on"} onChange={(e) => savePrefs({ ...prefs, wordWrap: e.target.checked ? "on" : "off" })} /></label>
                  <label className="flex items-center justify-between">Minimap
                    <input type="checkbox" checked={prefs.minimap} onChange={(e) => savePrefs({ ...prefs, minimap: e.target.checked })} /></label>
                  <button className="text-accent" onClick={() => savePrefs(DEFAULT_PREFS)}>Restore defaults</button>
                </div>
              )}
            </div>
          </div>
          <p className="border-b border-line bg-raised/50 px-3 py-1.5 text-xs text-muted">
            {official ? "Starter code from LeetCode. It is a function only: add your own input handling and main code to run it here." : "No official starter code for this language. This is a generic input/output template."}
            {lang === "java" && " Java programs must use a class named Main."}
          </p>
          <div className="min-h-72 flex-1">
            <Editor height="100%" theme="vs-dark" language={LANGUAGES[lang].monaco} path={`${slug}.${lang}`} value={code} onChange={changeCode}
              onMount={(ed) => { editorRef.current = ed; }}
              options={{ fontSize: prefs.fontSize, tabSize: prefs.tabSize, wordWrap: prefs.wordWrap, minimap: { enabled: prefs.minimap }, automaticLayout: true, scrollBeyondLastLine: false, fontFamily: "var(--font-plex-mono), monospace" }} />
          </div>

          <div className="max-h-[48%] overflow-y-auto border-t border-line bg-surface">
            <div className="flex flex-wrap items-center gap-2 p-2">
              <label htmlFor="stdin" className="text-xs text-muted">Custom input (stdin)</label>
              {exampleInput && <button className={btn} onClick={() => setStdin(exampleInput)}><TextCursorInput size={13} />Load sample input</button>}
              <div className="ml-auto flex gap-2">
                <button className={btn} onClick={() => send("run")} disabled={!!busy}>{busy === "run" ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}Run</button>
                <button className="inline-flex h-8 items-center gap-1.5 rounded-md bg-accent px-3 text-xs font-medium text-accent-fg hover:opacity-90 disabled:opacity-50" onClick={() => send("submit")} disabled={!!busy}>
                  {busy === "submit" ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}Submit</button>
              </div>
            </div>
            <textarea id="stdin" value={stdin} onChange={(e) => setStdin(e.target.value)} rows={3} maxLength={16384} spellCheck={false}
              className="mx-2 mb-2 w-[calc(100%-1rem)] rounded-md border border-line bg-bg p-2 font-mono text-xs" placeholder="Text your program reads from standard input" />
            <div className="border-t border-line" aria-live="polite"><ResultPanel result={result} busy={busy} /></div>
          </div>
        </section>
      </div>
    </div>
  );
}
