import type { Category } from "@/lib/quiz-categories";

export type Archetype = {
  name: string;
  description: string;
};

type ArchetypePair = {
  categories: [Category, Category];
  archetype: Archetype;
};

// Order matters: it drives the single-category fallback map below
// (first pair listing a category in table order "owns" that category's
// fallback archetype). See docs/content-reference.md §3.
const ARCHETYPE_PAIRS: ArchetypePair[] = [
  {
    categories: ["isolation", "stonewalling"],
    archetype: {
      name: "The Slow Fade",
      description:
        "A pattern of quiet withdrawal and disconnection from your support system.",
    },
  },
  {
    categories: ["intermittent_reinforcement", "future_faking"],
    archetype: {
      name: "The Rollercoaster",
      description:
        "Hot-and-cold affection paired with promises that keep slipping.",
    },
  },
  {
    categories: ["gaslighting", "darvo"],
    archetype: {
      name: "The Mirror Breaker",
      description:
        "Your reality gets questioned, and concerns get turned back on you.",
    },
  },
  {
    categories: ["love_bombing", "future_faking"],
    archetype: {
      name: "The Sprinter",
      description:
        "A fast, intense start that hasn't translated into follow-through.",
    },
  },
  {
    categories: ["triangulation", "guilt_tripping"],
    archetype: {
      name: "The Puppeteer",
      description: "Comparisons and obligation used to steer your decisions.",
    },
  },
  {
    categories: ["negging", "intermittent_reinforcement"],
    archetype: {
      name: "The Undercutter",
      description:
        "Compliments that cut, paired with unpredictable warmth.",
    },
  },
];

// First pair (in table order) that lists a category wins its fallback slot.
const FALLBACK_ARCHETYPE: Partial<Record<Category, Archetype>> = {};
for (const pair of ARCHETYPE_PAIRS) {
  for (const category of pair.categories) {
    if (!FALLBACK_ARCHETYPE[category]) {
      FALLBACK_ARCHETYPE[category] = pair.archetype;
    }
  }
}

function findPairArchetype(a: Category, b: Category): Archetype | undefined {
  return ARCHETYPE_PAIRS.find(
    (pair) =>
      (pair.categories[0] === a && pair.categories[1] === b) ||
      (pair.categories[0] === b && pair.categories[1] === a),
  )?.archetype;
}

/**
 * top2 must already be tie-broken and ordered [primary, secondary]
 * per docs/content-reference.md §2 (lower question ID wins ties).
 */
export function resolveArchetype(top2: [Category, Category]): Archetype {
  const [primary, secondary] = top2;
  const pairMatch = findPairArchetype(primary, secondary);
  if (pairMatch) return pairMatch;

  // Fallback logic per §3: no defined pair matches, use the single
  // highest-scoring category's primary archetype instead.
  const fallback = FALLBACK_ARCHETYPE[primary];
  if (!fallback) {
    throw new Error(`No fallback archetype configured for category "${primary}"`);
  }
  return fallback;
}
