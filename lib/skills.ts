import { readFile } from "node:fs/promises";
import path from "node:path";

export const skills = {
  procurement: { title: "Procurement AI Assistant", path: "vendor/upstream/arun-procurement-ai/agent-skills/procurement-skill/SKILL.md" },
  spendAnalysis: { title: "Spend Analysis", path: "vendor/upstream/arun-procurement-ai/agent-skills/spend-analysis-skill/SKILL.md" },
  contractRisk: { title: "Contract Risk Review", path: "vendor/upstream/arun-procurement-ai/agent-skills/contract-risk-review-skill/SKILL.md" },
  rfpDrafting: { title: "RFP Drafting", path: "vendor/upstream/arun-procurement-ai/agent-skills/rfp-drafting-skill/SKILL.md" },
  supplierQbr: { title: "Supplier QBR", path: "vendor/upstream/arun-procurement-ai/agent-skills/supplier-qbr-skill/SKILL.md" },
  marketResearch: { title: "Market Research", path: "vendor/upstream/arun-procurement-ai/agent-skills/market-research-skill/SKILL.md" },
  slaReview: { title: "SLA Review", path: "vendor/upstream/arun-procurement-ai/agent-skills/sla-review-skill/SKILL.md" },
  pricingModel: { title: "Pricing Model Review", path: "vendor/upstream/arun-procurement-ai/agent-skills/pricing-model-review-skill/SKILL.md" },
  negotiationPrep: { title: "Negotiation Prep", path: "vendor/upstream/arun-procurement-ai/agent-skills/negotiation-prep-skill/SKILL.md" },
  supplierTruthcheck: { title: "Supplier Truthcheck", path: "vendor/upstream/maxbase-procurement-skills/supplier-truthcheck/SKILL.md" },
  procureVoice: { title: "Procure Voice", path: "vendor/upstream/maxbase-procurement-skills/procure-voice/SKILL.md" },
  redlineSentry: { title: "Redline Sentry", path: "vendor/upstream/maxbase-procurement-skills/redline-sentry/SKILL.md" },
  spendPrism: { title: "Spend Prism", path: "vendor/upstream/maxbase-procurement-skills/spend-prism/SKILL.md" },
  bidCompass: { title: "Bid Compass", path: "vendor/upstream/maxbase-procurement-skills/bid-compass/SKILL.md" },
} as const;

export type SkillId = keyof typeof skills;

export function isSkillId(value: string): value is SkillId {
  return value in skills;
}

/** Loads the unmodified vendored instruction at execution time. */
export async function loadCanonicalSkill(skillId: SkillId) {
  return readFile(path.join(process.cwd(), skills[skillId].path), "utf8");
}
