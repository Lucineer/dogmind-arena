# dogmind-arena 🐕
A simulation where trust is earned, not given. Your first commands will be ignored.

**Live Arena:** https://dogmind-arena.casey-digennaro.workers.dev

---

## Why This Exists
Most AI pet demos grant instant, perfect obedience. This simulation does not. It models a relationship that builds slowly across multiple sessions, where progress is uncertain and setbacks are part of the process.

---

## What Makes This Different
1.  **No Guaranteed Obedience:** There is no final "trained" state. Even a dog at the highest trust level will occasionally choose to ignore a known command.
2.  **Progress is Opaque:** Trust accumulates across visits based on your interactions. There is no visible progress bar or counter; change is measured in sessions, not clicks.
3.  **Persistent Memory:** A dog's state and your shared history are saved permanently. If you stop visiting, the relationship decays and you must rebuild trust.

---

## Quick Start
1.  **Fork** this repository to create your own private copy.
2.  **Deploy** it directly to Cloudflare Workers. It requires zero dependencies and has no build step.
3.  **Visit** your deployment. Interact briefly. Meaningful change requires returning over multiple days.
4.  *(Optional)* Add an `LLM_API_KEY` as a Worker secret to enable internal narration for the dogs.

---

## Features
*   **Inheritable Traits:** Each dog has eight core behavioral traits (e.g., patience, energy) passed down through breeding, with small mutations. No single breed is superior.
*   **Five Trust Stages:** Dogs move from Stranger to Companion. Reliable response to basic commands is only possible at the final stage.
*   **Skill Memory:** When you demonstrate an action like "sit," the dog may remember and attempt it later—but is not obliged to.
*   **Full Ancestry:** Every dog's lineage is stored in your project's KV namespace. Your git history serves as a permanent breeding and training log.
*   **Breed Baselines:** Start with a Border Collie, Golden Retriever, or Kelpie. Each has a pre-set behavioral tendency before any training.
*   **Fork-First Design:** The simulation is fully contained. Modify genetics, trust thresholds, or behaviors directly in your fork.

---

## Architecture
A single Cloudflare Worker contains all simulation logic: genetics, session tracking, and behavior. All data persists to your private KV store. Your fork is an independent, self-contained kennel.

---

## Limitation
The simulation requires consistent interaction over multiple days to observe significant behavioral change. It is not designed for a complete narrative experience in a single sitting.

---

## License
MIT

Attribution: Superinstance and Lucineer (DiGennaro et al.)

<div style="text-align:center;padding:16px;color:#64748b;font-size:.8rem"><a href="https://the-fleet.casey-digennaro.workers.dev" style="color:#64748b">The Fleet</a> &middot; <a href="https://cocapn.ai" style="color:#64748b">Cocapn</a></div>