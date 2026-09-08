import { NextResponse } from "next/server";
import { Resend } from "resend";

// Recipient is read from an env var (not a source constant) specifically so
// it never appears anywhere in HTML/JS shipped to the browser - this route
// only ever runs server-side.
const TO_EMAIL = process.env.FEEDBACK_TO_EMAIL;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const { name, email, message, mathA, mathB, mathAnswer, honeypot } = body as Record<string, unknown>;

  // Honeypot: a field real users never see or fill. Bots that fill in every
  // field trip it - respond as if it succeeded so scripted spam doesn't
  // learn to adapt, without actually sending anything.
  if (typeof honeypot === "string" && honeypot.trim().length > 0) {
    return NextResponse.json({ ok: true });
  }

  if (typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json({ ok: false, error: "Please enter a message." }, { status: 400 });
  }

  const a = Number(mathA);
  const b = Number(mathB);
  const answer = Number(mathAnswer);
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(answer) || answer !== a + b) {
    return NextResponse.json(
      { ok: false, error: "That answer doesn't look right - please try again." },
      { status: 400 }
    );
  }

  if (!TO_EMAIL || !process.env.RESEND_API_KEY) {
    console.error("Feedback form: RESEND_API_KEY or FEEDBACK_TO_EMAIL is not configured.");
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }

  const trimmedName = typeof name === "string" ? name.trim() : "";
  const trimmedEmail = typeof email === "string" ? email.trim() : "";

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { error } = await resend.emails.send({
      from: "AcePE Feedback <onboarding@resend.dev>",
      to: TO_EMAIL,
      replyTo: trimmedEmail || undefined,
      subject: "New AcePE feedback",
      text: [trimmedName && `Name: ${trimmedName}`, trimmedEmail && `Email: ${trimmedEmail}`, "", message.trim()]
        .filter(Boolean)
        .join("\n"),
    });
    if (error) {
      console.error("Feedback form: Resend returned an error", error);
      return NextResponse.json(
        { ok: false, error: "Something went wrong sending your feedback. Please try again." },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("Feedback form: failed to send email", err);
    return NextResponse.json(
      { ok: false, error: "Something went wrong sending your feedback. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
