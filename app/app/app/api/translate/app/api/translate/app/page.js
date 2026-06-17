"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";

const PLACEHOLDER = `I am beyond humbled and incredibly excited to announce that I'm starting a new chapter as Senior Vice President of Synergy...`;

export default function Home() {
  const [post, setPost] = useState("");
  const [translation, setTranslation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);

  async function translate() {
    const text = post.trim();
    if (!text || loading) return;
    setLoading(true);
    setError("");
    setTranslation("");
    setCopied(false);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Something went wrong.");
      setTranslation(data.translation);
    } catch (err) {
      setError(err.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyText() {
    if (!translation) return;
    try {
      await navigator.clipboard.writeText(translation);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setError("Couldn't copy. Select the text manually.");
    }
  }

  async function shareImage() {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: "#F3F2EF",
        cacheBust: true,
      });
      const link = document.createElement("a");
      link.download = "linkedin-translation.png";
      link.href = dataUrl;
      link.click();
    } catch {
      setError("Couldn't make the image. Try a screenshot instead.");
    }
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:py-14">
      <div className="mx-auto w-full max-w-xl">
        <header className="mb-6 text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-linkedin font-extrabold text-white">
              in
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              Translator
            </h1>
          </div>
          <p className="text-sm text-muted sm:text-base">
            Paste a LinkedIn post. Get what it{" "}
            <span className="bg-highlight px-1 font-semibold text-ink">actually</span>{" "}
            means.
          </p>
        </header>

        <section className="rounded-xl border border-hairline bg-white p-4 shadow-card">
          <label htmlFor="post" className="sr-only">LinkedIn post</label>
          <textarea
            id="post"
            value={post}
            onChange={(e) => setPost(e.target.value)}
            placeholder={PLACEHOLDER}
            rows={6}
            className="w-full resize-y rounded-lg border border-hairline bg-canvas p-3 text-[15px] leading-relaxed text-ink outline-none focus:border-linkedin focus:ring-2 focus:ring-linkedin/20"
          />
          <button
            onClick={translate}
            disabled={loading || !post.trim()}
            className="mt-3 w-full rounded-full bg-linkedin py-3 text-base font-semibold text-white transition hover:bg-linkedinDark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Decoding…" : "Translate"}
          </button>
          {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}
          <p className="mt-3 text-center text-xs text-muted">
            Names, @handles, and links are stripped before anything is sent.
          </p>
        </section>

        {translation && (
          <section className="mt-6">
            <p className="mb-2 ml-1 text-xs font-bold uppercase tracking-widest text-muted">
              Translation
            </p>
            <div ref={cardRef} className="overflow-hidden rounded-xl border border-hairline bg-white shadow-card">
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-linkedin to-linkedinDark text-lg font-bold text-white">
                    💼
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold text-ink">
                      What they actually meant
                      <span className="font-normal text-muted"> · 1st</span>
                    </p>
                    <p className="truncate text-xs text-muted">Brutally Honest · Powered by spite</p>
                    <p className="text-xs text-muted">now · 🌐</p>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
                  {translation}
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-hairline px-4 py-2 text-xs text-muted">
                <span>👍😬💀 You and 1,204 others</span>
                <span>87 comments</span>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={copyText}
                className="flex-1 rounded-full border border-linkedin py-2.5 text-sm font-semibold text-linkedin transition hover:bg-linkedin/5"
              >
                {copied ? "Copied ✓" : "Copy"}
              </button>
              <button
                onClick={shareImage}
                className="flex-1 rounded-full bg-ink py-2.5 text-sm font-semibold text-white transition hover:bg-black"
              >
                Share as image
              </button>
            </div>
          </section>
        )}

        <footer className="mt-10 border-t border-hairline pt-5 text-xs leading-relaxed text-muted">
          <p className="mb-2 text-center text-sm font-semibold text-ink">
            Satire tool. Don&rsquo;t be weird.
          </p>
          <p className="mb-2">
            Every translation is AI-generated satire and opinion &mdash; exaggerated
            comedic interpretation, not a statement of fact about any real person
            or company. Names, handles, and links are stripped before processing,
            and output refers only to &ldquo;they.&rdquo;
          </p>
          <p className="mb-2">
            Not affiliated with, endorsed by, or connected to LinkedIn or Microsoft.
            The name is used only to describe the style of post being parodied.
          </p>
          <p className="mb-2">
            Don&rsquo;t paste private, confidential, or other people&rsquo;s personal
            information, and don&rsquo;t use this to harass or target anyone. You are
            responsible for what you paste and for anything you choose to share.
          </p>
          <p>Provided &ldquo;as is,&rdquo; no warranties, for entertainment. Use at your own risk.</p>
        </footer>
      </div>
    </main>
  );
}
