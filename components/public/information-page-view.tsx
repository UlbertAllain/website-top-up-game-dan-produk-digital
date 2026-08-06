import Image from "next/image";
import Link from "next/link";

import styles from "@/components/public/game-commerce.module.css";
import type { ContentPage } from "@/features/content/content.types";

type InformationPageViewProps = {
  page: ContentPage;
  eyebrow: string;
};

type ContentBlock =
  | {
      type: "paragraph";
      content: string;
    }
  | {
      type: "list";
      items: string[];
    };

function parseContent(content: string): ContentBlock[] {
  const lines = content
    .split("\n")
    .map((line) => line.trim());

  const blocks: ContentBlock[] = [];
  let listItems: string[] = [];

  function pushList() {
    if (listItems.length === 0) {
      return;
    }

    blocks.push({
      type: "list",
      items: listItems,
    });

    listItems = [];
  }

  for (const line of lines) {
    if (!line) {
      pushList();
      continue;
    }

    const orderedMatch = line.match(/^\d+[.)]\s+(.+)$/);
    const bulletMatch = line.match(/^[-•]\s+(.+)$/);

    if (orderedMatch) {
      listItems.push(orderedMatch[1]);
      continue;
    }

    if (bulletMatch) {
      listItems.push(bulletMatch[1]);
      continue;
    }

    pushList();

    blocks.push({
      type: "paragraph",
      content: line,
    });
  }

  pushList();

  return blocks;
}

function formatUpdatedAt(value: string | null): string {
  if (!value) {
    return "Belum diperbarui";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Tanggal tidak tersedia";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function InformationPageView({
  page,
  eyebrow,
}: InformationPageViewProps) {
  const contentBlocks = parseContent(page.content);

  return (
    <main className="bg-[#070b14] px-4 py-5 text-white sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4">
        <section
          className={`${styles.panel} ${styles.cut} relative overflow-hidden rounded-[30px]`}
        >
          <div className="absolute inset-y-0 right-0 hidden w-[48%] lg:block">
            <Image
              src="/nexty-showcase/hero-banner.png"
              alt={page.title}
              fill
              priority
              sizes="48vw"
              className="object-cover object-center"
            />

            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,11,20,0.96)_0%,rgba(7,11,20,0.5)_45%,rgba(7,11,20,0.74)_100%)]" />
          </div>

          <div className="relative z-[1] px-6 py-10 sm:px-8 lg:px-10 lg:py-16">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#8ea7ff] transition hover:text-white"
            >
              <span aria-hidden="true">←</span>
              Kembali ke beranda
            </Link>

            <p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-[#8ea7ff]">
              {eyebrow}
            </p>

            <h1 className="mt-3 max-w-3xl text-[2.7rem] font-black leading-[0.95] tracking-[-0.05em] text-white sm:text-[4rem] lg:text-[4.8rem]">
              {page.title}
            </h1>

            {page.excerpt ? (
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/62 sm:text-lg">
                {page.excerpt}
              </p>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-2">
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">
                /{page.slug}
              </span>

              <span className="rounded-full border border-[#3b6fff]/30 bg-[#3b6fff]/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#b6c6ff]">
                Diperbarui {formatUpdatedAt(page.updatedAt)}
              </span>
            </div>
          </div>
        </section>

        <section className="grid items-start gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside
            className={`${styles.panel} ${styles.cut} rounded-[28px] p-6 lg:sticky lg:top-24`}
          >
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8ea7ff]">
              Informasi Halaman
            </p>

            <h2 className="mt-3 text-2xl font-black leading-tight text-white">
              Ringkas, jelas, dan mudah dipahami.
            </h2>

            <p className="mt-4 text-sm leading-7 text-white/58">
              Seluruh informasi pada halaman ini dikelola melalui dashboard
              admin dan dapat diperbarui tanpa mengubah kode program.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                href="/about"
                className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/70 transition hover:border-[#3b6fff]/30 hover:text-white"
              >
                <span>Tentang Kami</span>
                <span aria-hidden="true">→</span>
              </Link>

              <Link
                href="/how-to-order"
                className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/70 transition hover:border-[#3b6fff]/30 hover:text-white"
              >
                <span>Cara Pemesanan</span>
                <span aria-hidden="true">→</span>
              </Link>

              <Link
                href="/terms"
                className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/70 transition hover:border-[#3b6fff]/30 hover:text-white"
              >
                <span>Syarat & Ketentuan</span>
                <span aria-hidden="true">→</span>
              </Link>

              <Link
                href="/privacy"
                className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white/70 transition hover:border-[#3b6fff]/30 hover:text-white"
              >
                <span>Kebijakan Privasi</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </aside>

          <article
            className={`${styles.panelLight} ${styles.cut} rounded-[30px] p-6 text-[#0c1424] sm:p-8 lg:p-10`}
          >
            <div className="border-b border-[#0c1424]/8 pb-6">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#3b6fff]">
                Detail Informasi
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#0c1424] sm:text-4xl">
                {page.title}
              </h2>
            </div>

            <div className="mt-8 space-y-6">
              {contentBlocks.length > 0 ? (
                contentBlocks.map((block, blockIndex) => {
                  if (block.type === "list") {
                    return (
                      <div
                        key={`list-${blockIndex}`}
                        className="grid gap-3"
                      >
                        {block.items.map((item, itemIndex) => (
                          <div
                            key={`${item}-${itemIndex}`}
                            className="grid grid-cols-[38px_minmax(0,1fr)] items-start gap-4 rounded-[22px] border border-[#0c1424]/8 bg-white/70 p-4 sm:p-5"
                          >
                            <span className="flex size-9 items-center justify-center rounded-xl bg-[#0c1424] text-xs font-black text-white">
                              {String(itemIndex + 1).padStart(2, "0")}
                            </span>

                            <p className="pt-1 text-base leading-8 text-[#243048]/78">
                              {item}
                            </p>
                          </div>
                        ))}
                      </div>
                    );
                  }

                  return (
                    <p
                      key={`${block.content}-${blockIndex}`}
                      className="text-base leading-8 text-[#243048]/78"
                    >
                      {block.content}
                    </p>
                  );
                })
              ) : (
                <div className="rounded-[24px] border border-dashed border-[#0c1424]/14 bg-white/60 px-6 py-12 text-center">
                  <p className="font-bold text-[#0c1424]">
                    Konten belum tersedia
                  </p>

                  <p className="mt-2 text-sm leading-7 text-[#243048]/65">
                    Isi halaman dapat ditambahkan melalui dashboard admin.
                  </p>
                </div>
              )}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
