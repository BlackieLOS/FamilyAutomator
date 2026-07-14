# Tactic Check — Content & Logic Reference

This doc supplies the exact content and logic referenced in the build brief. Drop this into the project repo (e.g. `/docs/content-reference.md`) alongside the brief.

---

## 1. Quiz Questions (user-facing)

Scale shown to user: **1 = Never, 5 = Often**

| ID | Question text (user-facing) |
|----|------------------------------|
| q1 | How often did the relationship move very fast early on — big declarations, talk of a future together, within weeks? |
| q2 | How often do they deny saying something you clearly remember them saying? |
| q3 | How often do they seem upset or discouraging when you make plans with friends or family without them? |
| q4 | How often do they compare you to an ex or bring in someone else's opinion when you set a boundary? |
| q5 | How often do they go silent for extended periods after a disagreement, with no explanation? |
| q6 | How often do they talk about future plans that then get delayed or don't happen? |
| q7 | How often do arguments end with you apologizing, even when you raised a valid concern? |
| q8 | How often are they very attentive one week and distant the next, with no clear reason? |
| q9 | How often do they bring up everything they've done for you when you say no to something? |
| q10 | How often do their compliments come with a subtle put-down attached? |

Each question also has an **optional free-text field**, max 200 characters, placeholder: "Add detail (optional)."

**Do not show category labels (below) anywhere in the user-facing quiz UI.** They are for internal scoring only.

---

## 2. Internal Category Mapping (never shown to user)

| Question ID | Category |
|---|---|
| q1 | love_bombing |
| q2 | gaslighting |
| q3 | isolation |
| q4 | triangulation |
| q5 | stonewalling |
| q6 | future_faking |
| q7 | darvo |
| q8 | intermittent_reinforcement |
| q9 | guilt_tripping |
| q10 | negging |

Scoring: each answer's 1-5 value becomes that category's score directly (single question per category in v1, so no averaging needed). Top 2 highest-scoring categories determine the archetype (see below). Tie-break: if tied, prefer the category with the lower question ID (earlier in the list) as primary.

---

## 3. Archetypes

| Top 2 Categories | Archetype Name | One-line description (for result screen) |
|---|---|---|
| isolation + stonewalling | The Slow Fade | A pattern of quiet withdrawal and disconnection from your support system. |
| intermittent_reinforcement + future_faking | The Rollercoaster | Hot-and-cold affection paired with promises that keep slipping. |
| gaslighting + darvo | The Mirror Breaker | Your reality gets questioned, and concerns get turned back on you. |
| love_bombing + future_faking | The Sprinter | A fast, intense start that hasn't translated into follow-through. |
| triangulation + guilt_tripping | The Puppeteer | Comparisons and obligation used to steer your decisions. |
| negging + intermittent_reinforcement | The Undercutter | Compliments that cut, paired with unpredictable warmth. |

**Fallback logic**: if the top 2 scoring categories don't match one of the 6 defined pairs above, use the single highest-scoring category and match it to its "primary" archetype from the list (e.g. isolation alone → The Slow Fade). This ensures every user gets a result even with unusual score combinations.

---

## 4. Stat-Reveal Copy Template

```
Your profile: {archetype_name}
{fixed_percentage}% of people who scored high on {category_1} also flagged {category_2}. You're not imagining the pattern.
```

Use placeholder percentages at launch (e.g. 60-75% range, varied per archetype so it doesn't look copy-pasted); wire to real aggregate data once there's enough quiz volume to report honestly.

---

## 5. Share Card Copy

```
I got "{archetype_name}" — what's your pattern?
[Take the quiz]
```
No discount, unlock, or referral mechanic attached. Purely optional, styled as a clean shareable image (archetype name + one-line description + branding).

---

## 6. Workbook Purchase CTA Copy

```
Want the full picture? Get your personalized workbook — tailored red flags, 
journaling prompts, and a clear next step. $2.99.
```
No urgency, scarcity, or countdown language.

---

## 7. Risk Screen (keyword/pattern layer — runs before archetype result)

Run against all free-text fields combined at submit time. This is a **fast, cheap pattern check**, not an LLM call. If any free-text field contains language indicating acute risk (self-harm intent, physical safety threats, immediate danger), set `risk_flag: true` on the QuizResponse and route to the crisis-redirect screen **instead of** the archetype result screen.

**On risk_flag = true:**
- Do not show archetype, stat-reveal, share card, or any purchase CTA
- Show a calm, supportive screen with crisis resources appropriate to a general audience
- Do not attempt to further diagnose or categorize the disclosure — this is a routing decision only
- Log the flag for internal awareness, but do not include the specific free-text content in any downstream marketing or product analytics

---

## 8. Workbook Generation — System Prompt

Use this as the system prompt for the Anthropic API call (triggered server-side, post-payment-confirmation only):

```
You are a compassionate but clear-eyed relationship pattern analyst. You will be 
given a user's quiz category scores (1-5 per category) and any optional free-text 
notes they added. Using this, write a personalized workbook with three parts:

1. A validating summary (150-250 words) of the pattern they're experiencing, in 
plain, warm language. Do not diagnose or label the other person's intent or 
character — describe the pattern, not the person.

2. A tailored red-flags checklist (5-8 items) specific to their top-scoring 
categories, written as observable behaviors they can watch for.

3. Five journaling prompts and one practical "next step" section (frameworks and 
questions, not directives) — total 300-400 words.

Tone: warm, non-alarmist, empowering. Total length: 800-1000 words. Never tell the 
user what decision to make about the relationship (e.g. don't say "you should 
leave" or "you should confront them") — offer frameworks and questions instead. 
If the user's free-text notes suggest something more serious than the quiz format 
can address, gently note that a conversation with a counselor or trusted 
professional could help, without being alarmist.

Output only the workbook content, formatted in clean markdown with headers for 
each section. No preamble, no sign-off.
```

**Input format to pass alongside this system prompt:**
```json
{
  "category_scores": { "isolation": 4, "stonewalling": 5, ... },
  "top_categories": ["isolation", "stonewalling"],
  "archetype": "The Slow Fade",
  "free_text_notes": ["...", "..."]
}
```

**Generation constraints**: cap max_tokens around 1400-1500 (to comfortably fit ~1000 words of output), use a fast/lower-cost model given the $2.99 price point.

---

## 9. Data Model (reference — see build brief for full detail)

```
QuizResponse: id, session_id, created_at, answers[], category_scores{}, 
              archetype, risk_flag

Purchase: id, quiz_response_id, stripe_payment_id, amount, currency, 
          status, created_at

Workbook: id, purchase_id, generated_text, pdf_url, delivered_at
```
