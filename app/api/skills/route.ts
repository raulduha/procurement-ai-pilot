import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { isSkillId, loadCanonicalSkill, skills } from "@/lib/skills";
import { requirePilotUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { skillId, question, documentText = "" } = await request.json();
    if (typeof skillId !== "string" || !isSkillId(skillId)) return NextResponse.json({ error: "Skill no permitida." }, { status: 400 });
    if (typeof question !== "string" || !question.trim()) return NextResponse.json({ error: "Escribe una solicitud para la skill." }, { status: 400 });
    if (typeof documentText !== "string" || documentText.length > 120_000) return NextResponse.json({ error: "El contenido supera el límite permitido." }, { status: 400 });
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Claude API no está configurada en el servidor." }, { status: 503 });
    const { supabase, user } = await requirePilotUser();
    const instruction = await loadCanonicalSkill(skillId);
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
      max_tokens: 3000,
      system: `${instruction}\n\nINTEGRATION SAFETY NOTICE: This is a private pilot. Do not take external actions, make awards, execute contracts, or make final supplier decisions. Clearly request human review for any recommendation.`,
      messages: [{ role: "user", content: `Request:\n${question.trim()}\n\nDocument text (may be empty):\n${documentText.slice(0, 120_000)}` }],
    });
    const answer = message.content.filter((part) => part.type === "text").map((part) => part.text).join("\n");
    await supabase.from("skill_runs").insert({ user_id: user.id, skill_id: skillId, prompt: question.trim(), result: answer });
    return NextResponse.json({ skill: skills[skillId].title, answer, reviewRequired: true });
  } catch (error) {
    console.error("Skill execution failed", error);
    const message = error instanceof Error ? error.message : "No fue posible ejecutar la skill.";
    return NextResponse.json({ error: message }, { status: message.includes("iniciar sesión") || message.includes("autorizada") ? 401 : 500 });
  }
}
