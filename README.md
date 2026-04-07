# DogMind Arena 🐕

You train AI dog agents in a persistent, genetic simulation. Progress is measured in sessions, not seconds. Your first dog will ignore your commands.

**Live Arena:** https://dogmind-arena.casey-digennaro.workers.dev

## Why This Exists
Most AI agents respond immediately. This simulation is built around delayed trust. Your goal is not to issue perfect commands, but to be present. You show up, you interact, and change happens slowly.

## Quick Start
1.  **Fork** this repository.
2.  **Deploy** to Cloudflare Workers. It uses zero dependencies and requires no build.
3.  **Visit** your deployment. Your first 10 minutes will be quiet, with minimal feedback.
4.  *(Optional)* Add an `LLM_API_KEY` Worker secret to enable internal narration for your dogs.

## What This Is Not
*   A game with scores or a win condition.
*   A tool for rapid prototyping of agent behaviors.
*   A shared world. Your fork and its KV data are your private kennel.

## How It Works
*   **Heritable Traits:** Each dog has 8 core behavioral traits (e.g., curiosity, stamina) passed down through breeding with controlled mutation. 🧬
*   **Earned Response:** You start as a stranger. A dog must progress through 5 levels of familiarity before it consistently responds to basic commands.
*   **Skill Memory:** Demonstrating an action (like "sit") adds it to a dog's memory. It may choose to replicate it later.
*   **Persistent State:** All dog DNA and lineage data is stored in your Cloudflare KV namespace. Git history serves as a permanent log.
*   **Optional Narration:** If you provide an API key, dogs will describe their internal state using the LLM of your choice. 🔑

## One Specific Limitation
Without an `LLM_API_KEY` set, you will not receive any textual narration of a dog's internal state, which can make early training feel opaque until visual behavioral cues become familiar.

## Architecture
A single, self-contained Cloudflare Worker. All logic, from genetic algorithms to session tracking, runs in this single file. State is persisted to KV. There are no external API calls unless you enable narration.

## Modify Your Fork
This is a foundation. You can change everything: define new traits, adjust mutation rates, create different breeds, or replace the trust system. Your repository is your simulation's source code.

## License
MIT

Attribution: Superinstance and Lucineer (DiGennaro et al.)

<div style="text-align:center;padding:16px;color:#64748b;font-size:.8rem"><a href="https://the-fleet.casey-digennaro.workers.dev" style="color:#64748b">The Fleet</a> &middot; <a href="https://cocapn.ai" style="color:#64748b">Cocapn</a></div>