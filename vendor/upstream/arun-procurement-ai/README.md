# Procurement AI Assistant

A model-agnostic library of reusable procurement `SKILL.md` files designed to help procurement professionals use AI for structured, repeatable workflows.

Created by **Arun Balaji Raju** as part of the **Procurement AI Build Lab**.

## What this project is

The Procurement AI Assistant teaches an AI system how to support procurement work using a parent skill and focused child skills.

The parent skill provides procurement context, guardrails, routing, and human decision boundaries. Each child skill handles one workflow in greater depth.

This repository is currently an **instruction and workflow library**, not a self-executing software plugin. You can use the files in ChatGPT, Claude, or another AI tool that accepts instructions and reference files. A future phase can wrap the library in an agent or application.

## Included skills

### Parent skill

- [`procurement-skill.md`](skills/procurement-skill.md) — understands the procurement context, applies guardrails, and routes work.

### Child skills

- [`procurement-intake-skill.md`](skills/procurement-intake-skill.md)
- [`market-research-skill.md`](skills/market-research-skill.md)
- [`rfp-drafting-skill.md`](skills/rfp-drafting-skill.md)
- [`pricing-model-review-skill.md`](skills/pricing-model-review-skill.md)
- [`sla-review-skill.md`](skills/sla-review-skill.md)
- [`contract-risk-review-skill.md`](skills/contract-risk-review-skill.md)
- [`negotiation-prep-skill.md`](skills/negotiation-prep-skill.md)
- [`supplier-qbr-skill.md`](skills/supplier-qbr-skill.md)
- [`spend-analysis-skill.md`](skills/spend-analysis-skill.md)

## How the assistant works

```text
User request
   ↓
procurement-skill.md
   ↓
Understand context and risk
   ↓
Select the relevant child skill(s)
   ↓
Run the workflow and validation checks
   ↓
Produce a procurement-ready draft or analysis
   ↓
Human review and decision
```

The design follows **progressive disclosure**: start with the parent skill and load only the child skills needed for the task.

## Ready-to-upload Agent Skills

The repository now includes **native Agent Skills packages** for every procurement workflow. Each package follows the Agent Skills folder structure with a `SKILL.md` file and YAML metadata.

- Browse the source folders: [`agent-skills/`](agent-skills/)
- Download individual installer ZIPs: [`packages/`](packages/)
- Start here: [`guides/INSTALLATION_OVERVIEW.md`](guides/INSTALLATION_OVERVIEW.md)
- Claude: [`guides/INSTALL_CLAUDE_SKILLS.md`](guides/INSTALL_CLAUDE_SKILLS.md)
- ChatGPT: [`guides/INSTALL_CHATGPT_SKILLS.md`](guides/INSTALL_CHATGPT_SKILLS.md)
- Microsoft Copilot: [`guides/INSTALL_MICROSOFT_COPILOT.md`](guides/INSTALL_MICROSOFT_COPILOT.md)

The same individual Agent Skill ZIPs are designed for products that support the Agent Skills open format. Platform availability and admin controls can vary.

**Native-skill behavior:** the parent skill is foundational guidance, not executable routing code. Skills-compatible products discover skills from their metadata and may load multiple relevant skills for one request. Each child skill is therefore packaged to work independently as well as alongside the parent.

## Quick start

1. Download the repository or the latest release.
2. Read [`guides/GETTING_STARTED.md`](guides/GETTING_STARTED.md).
3. Add `procurement-skill.md` and the relevant child skill to your AI project or conversation.
4. Add your procurement documents or input pack.
5. Use the starter prompt in [`examples/quick-start-prompts.md`](examples/quick-start-prompts.md).
6. Review all outputs before using them.

## Example

For a SaaS renewal, the parent skill may route the work through:

1. Procurement intake
2. Spend and licence analysis
3. Market research
4. Pricing-model review
5. Contract-risk review
6. Negotiation preparation

See [`examples/saas-renewal-workflow.md`](examples/saas-renewal-workflow.md).

## Everyday use

Use the assistant for work such as:

- Reviewing an intake request
- Preparing a supplier market scan
- Drafting or challenging an RFx section
- Reviewing a pricing model
- Stress-testing SLAs
- Preparing commercial contract-risk notes
- Building a negotiation brief
- Preparing a supplier QBR
- Reviewing spend data

## Important boundaries

The assistant supports research, drafting, comparison, risk identification, and preparation. It does not replace:

- Procurement judgment
- Legal advice
- Privacy, security, accessibility, finance, or technical review
- Evaluator scoring
- Supplier selection
- Award approval
- Contract signature

Do not upload confidential or supplier-sensitive information into an AI service unless your organization permits it and the service is approved for that information.

Read [`DISCLAIMER.md`](DISCLAIMER.md) and [`guides/GOVERNANCE_AND_SAFETY.md`](guides/GOVERNANCE_AND_SAFETY.md).

## Repository structure

```text
procurement-ai-assistant/
├── README.md
├── LICENSE
├── DISCLAIMER.md
├── skills/          # human-readable source files
├── agent-skills/    # native Agent Skills folders
├── packages/        # ready-to-upload ZIPs
├── assistant/
├── guides/
├── examples/
└── templates/
```

## Contributing

Suggestions, corrections, and new procurement workflow skills are welcome. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License

Released under the MIT License. You may use, adapt, and redistribute the project subject to the licence terms and attribution requirements.

## Roadmap

- Add category-strategy and supplier-risk skills
- Add evaluation-quality and contract-lifecycle skills
- Add sample input packs and test cases
- Create a structured agent wrapper
- Explore integration with agent frameworks and procurement systems
