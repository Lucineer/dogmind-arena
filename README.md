# DogMind Arena — Train Agents Through Trust 🐕

You train AI dog agents in a persistent, genetic simulation. Progress is slow. They ignore you at first. Your actions are permanent.

---

## Why this exists
Most agent demos are built for immediate obedience. This explores a slower dynamic: what happens when you must earn an agent's attention through consistent interaction? Every choice accumulates. Nothing is reset.

**Live Arena:** https://dogmind-arena.casey-digennaro.workers.dev

---

## How it works
*   **Heritable Traits:** Each dog has 8 core traits (e.g., Brave, Patient) that influence its reactions. A brave dog investigates loud noises; a patient dog waits longer for your return.
*   **Earned Trust:** You begin as a stranger. Commands are often ignored. Through repeated positive interaction, you advance through 5 bond levels, up to a state of learned cooperation.
*   **Skill Memory:** Skills are not unlocked with points. You demonstrate a command, the dog remembers the pattern, and with enough repetition, it becomes a habitual response.
*   **Genetic Lines:** Breed two dogs to combine and mutate their traits. Run generational experiments in your forked kennel over time.
*   **Optional Narration:** Enable to have each dog describe its internal state using your own LLM API key.
*   **Stateless Runtime:** Deploys as a single Cloudflare Worker with zero dependencies. No database; persistence is managed via your repository.

---

## What to expect
This is a foundational simulation, not a polished game:
*   **No resets.** All interactions are permanent for each dog's lineage.
*   **Fork-first ownership.** Your repository is your kennel. You control all changes.
*   **Slow progression.** Early training requires patience. This is by design.
*   **One honest limitation:** The genetic system is experimental. While traits are heritable, the expression of complex behaviors across generations can be unpredictable.

---

## Quick start
1.  Fork this repository.
2.  Deploy to Cloudflare Workers (using the `wrangler` CLI or dashboard).
3.  *(Optional)* Add an `LLM_API_KEY` secret for narration.
4.  Visit your deployment and begin training. The first interactions will be quiet.

---

## Build from this foundation
Modify your fork to:
*   Introduce new breeds, traits, or environmental stimuli.
*   Create training courses or work tasks.
*   Replace the narration engine with a different model or provider.
*   Experiment with alternate trust or inheritance algorithms.

Contributions are welcome via pull request, but the intended path is experimentation in your own fork.

---

MIT License.

**Attribution:** Superinstance & Lucineer (DiGennaro et al.).

<div>
  <strong>Part of the Cocapn Fleet:</strong>
  <a href="https://the-fleet.casey-digennaro.workers.dev">The Fleet</a> •
  <a href="https://cocapn.ai">Cocapn</a>
</div>