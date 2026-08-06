"use client";

import { useState } from "react";

type LogoutButtonProps = {
  collapsed?: boolean;
};

export function LogoutButton({ collapsed = false }: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");

  async function handleLogout() {
    if (isLoading) {
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/session", {
        method: "DELETE",
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Logout gagal diproses.");
      }

      window.location.replace("/login");
    } catch {
      setError("Logout gagal. Silakan coba kembali.");

      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoading}
        title={collapsed ? "Keluar dari akun" : undefined}
        className={[
          "flex w-full items-center rounded-xl text-sm font-medium transition",
          "text-neutral-600 hover:bg-red-50 hover:text-red-700",
          "disabled:cursor-not-allowed disabled:opacity-60",
          collapsed ? "justify-center px-3 py-3" : "gap-3 px-3 py-2.5",
        ].join(" ")}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H3" />
          <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
        </svg>

        {!collapsed ? <span>{isLoading ? "Keluar..." : "Keluar"}</span> : null}
      </button>

      {error && !collapsed ? (
        <p className="mt-2 px-3 text-xs text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
