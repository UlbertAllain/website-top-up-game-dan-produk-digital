"use client";

import { type FormEvent, useState } from "react";

import {
  inMemoryPersistence,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { firebaseAuth } from "@/lib/firebase/client";

type SessionResponse = {
  success: boolean;

  error?: {
    code?: string;
    message?: string;
  };
};

export function LoginForm() {
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await setPersistence(firebaseAuth, inMemoryPersistence);

      const credential = await signInWithEmailAndPassword(
        firebaseAuth,
        email.trim(),
        password,
      );

      const idToken = await credential.user.getIdToken(true);

      const response = await fetch("/api/auth/session", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          idToken,
        }),

        credentials: "same-origin",
        cache: "no-store",
      });

      const result = (await response.json()) as SessionResponse;

      if (!response.ok || !result.success) {
        throw new Error("Akses admin tidak valid.");
      }

      await signOut(firebaseAuth);

      window.location.replace("/admin");
    } catch {
      await signOut(firebaseAuth).catch(() => undefined);

      setPassword("");

      setError("Email, password, atau akses admin tidak valid.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="email">Email admin</label>

        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>

        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>

      {error ? <p role="alert">{error}</p> : null}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Memproses..." : "Masuk"}
      </button>
    </form>
  );
}
