import Link from "next/link";

import styles from "@/components/public/game-store.module.css";
import type { ContentPage } from "@/features/content/content.types";

type InformationPageViewProps = {
  page: ContentPage;
  eyebrow: string;
};

function renderContent(content: string) {
  const lines = content.split("\n").map((line) => line.trim());

  return lines.map((line, index) => {
    if (!line) {
      return <div key={`space-${index}`} className="h-3" />;
    }

    const orderedMatch = line.match(/^(\d+[.)])\s+(.+)$/);
    const bulletMatch = line.match(/^[-•]\s+(.+)$/);

    if (orderedMatch) {
      return (
        <div key={`${line}-${index}`} className="grid gap-4 border-t border-black/10 pt-5 sm:grid-cols-[52px_1fr]">
          <span className="text-sm font-black tracking-[0.14em] text-[#356df3]">
            {orderedMatch[1].replace(/[.)]/g, "").padStart(2, "0")}
          </span>
          <p className="text-base leading-8 text-black/58">{orderedMatch[2]}</p>
        </div>
      );
    }

    if (bulletMatch) {
      return (
        <div key={`${line}-${index}`} className="flex items-start gap-4">
          <span className="mt-3 size-1.5 shrink-0 rotate-45 bg-[#356df3]" />
          <p className="text-base leading-8 text-black/58">{bulletMatch[1]}</p>
        </div>
      );
    }

    return (
      <p key={`${line}-${index}`} className="text-base leading-8 text-black/58">
        {line}
      </p>
    );
  });
}

export function InformationPageView({ page, eyebrow }: InformationPageViewProps) {
  return (
    <main className={`${styles.shell} min-h-screen bg-[#06080d] px-4 pb-5 pt-[102px] sm:px-6 lg:px-8 lg:pb-8 lg:pt-[118px]`}>
      <article className="mx-auto w-full max-w-[1480px] overflow-hidden border border-white/10 bg-[#eef1f6]">
        <header className={`${styles.pageHero} ${styles.noise} relative min-h-[470px] overflow-hidden px-6 py-12 text-white sm:px-10 sm:py-16 lg:px-14 lg:py-20`}>
          <div className={`${styles.blueprint} pointer-events-none absolute inset-0 opacity-60`} />

          <div className="relative flex min-h-[320px] flex-col justify-between">
            <div className="flex items-center justify-between gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.17em] text-white/40 transition hover:text-white"
              >
                <span aria-hidden="true">←</span>
                Kembali ke Home
              </Link>

              <span className="hidden text-[9px] font-black uppercase tracking-[0.19em] text-white/24 sm:block">
                Information database / {page.slug}
              </span>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#9eb8ff]">
                {eyebrow}
              </p>
              <h1 className="mt-5 max-w-6xl text-4xl font-black leading-[0.88] tracking-[-0.07em] sm:text-5xl lg:text-7xl xl:text-8xl">
                {page.title}
              </h1>

              {page.excerpt ? (
                <p className="mt-7 max-w-3xl text-base leading-8 text-white/48 sm:text-lg">
                  {page.excerpt}
                </p>
              ) : null}
            </div>
          </div>
        </header>

        <div className="grid lg:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="border-b border-black/10 bg-[#e5e9f0] p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
            <div className="lg:sticky lg:top-28">
              <p className="text-[9px] font-black uppercase tracking-[0.21em] text-[#356df3]">
                Document info
              </p>

              <div className="mt-7 border-y border-black/10 py-5">
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-black/30">
                  Route
                </p>
                <p className="mt-2 break-all text-sm font-black text-[#06080d]">/{page.slug}</p>
              </div>

              <p className="mt-6 text-xs leading-7 text-black/40">
                Konten halaman ini dikelola melalui dashboard admin dan hanya tampil ketika statusnya dipublikasikan.
              </p>

              <Link
                href="/#faq"
                className="mt-8 flex h-12 items-center justify-between bg-[#06080d] px-4 text-[10px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-[#356df3]"
              >
                Buka FAQ
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </aside>

          <div className="p-6 sm:p-10 lg:p-14 xl:p-16">
            <div className="mx-auto max-w-3xl space-y-6">
              {renderContent(page.content)}
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
