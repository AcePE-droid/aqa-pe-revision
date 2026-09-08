"use client";

import { useState } from "react";

type Props = {
  mathA: number;
  mathB: number;
};

type Status = "idle" | "submitting" | "success" | "error";

const inputClasses =
  "rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none";

export default function FeedbackForm({ mathA, mathB }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [mathAnswer, setMathAnswer] = useState("");
  // Hidden from real users via the wrapper below - only bots that blindly
  // fill every field end up populating this.
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, mathA, mathB, mathAnswer, honeypot }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <p className="mt-6 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
        Thanks &mdash; your feedback has been sent.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
      <div className="absolute left-[-9999px]" aria-hidden="true">
        <label htmlFor="website">Leave this field blank</label>
        <input
          id="website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name (optional)"
        className={inputClasses}
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email (optional, so we can reply)"
        className={inputClasses}
      />
      <textarea
        required
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Your feedback"
        rows={5}
        className={inputClasses}
      />
      <label className="text-sm text-slate-600">
        What is {mathA} + {mathB}?
        <input
          type="text"
          required
          inputMode="numeric"
          value={mathAnswer}
          onChange={(e) => setMathAnswer(e.target.value)}
          className={`mt-1 block w-24 ${inputClasses}`}
        />
      </label>
      <button
        type="submit"
        disabled={status === "submitting"}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {status === "submitting" ? "Sending..." : "Send feedback"}
      </button>
      {status === "error" && errorMessage && <p className="text-sm text-red-700">{errorMessage}</p>}
    </form>
  );
}
