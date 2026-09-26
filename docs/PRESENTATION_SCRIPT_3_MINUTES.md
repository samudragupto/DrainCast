# DrainCast — 3-Minute Judge Presentation Script

> **Setup before you start:** open the deployed dashboard in one tab and the
> landing page in another. Keep the rainfall slider at the default 40 mm/hr.
> Practice the demo path twice; the clicks below are scripted so you never
> hunt for a control on stage.
>
> Speaking pace: ~130 words/minute. Total ≈ 430 words. Breathe between
> sections. Point at the screen for every bolded action.

---

## 00:00 – 00:25 · Problem Statement (25 s)

> "Every monsoon, Chennai gets the same warning: heavy rain expected.
> But a family in Velachery doesn't live in 'heavy rain' — they live on a
> specific street. **Rainfall prediction exists; street-level flood
> prediction does not.** Weather apps tell you it will rain. Nobody tells
> you that *your* road will be under fifteen centimetres of water by
> 6 p.m., or which route home still works.
>
> That gap is exactly what problem statement SIH26085 asks us to close —
> and that is what DrainCast does."

*(Stay on the landing page. The tagline does quiet work here.)*

---

## 00:25 – 00:55 · Our Idea — DrainCast (30 s)

> "DrainCast is a flood nowcasting system for urban India. One line:
> **it couples rainfall, terrain and the stormwater drainage network to
> predict which streets will flood, how deep, and how to route around them —
> zero to three hours ahead.**
>
> Why coupling? Because rain alone doesn't decide floods. Two streets under
> the same cloudburst can end up completely different — one drains in
> minutes, the other drowns, because its pipes are smaller and it sits in a
> low-lying pocket. A model that ignores drains and terrain can never tell
> them apart."

*(Click **Open Interactive Dashboard**.)*

---

## 00:55 – 01:15 · Core Concept (20 s)

> "Here is the whole science in four sentences.
> For every road: rainfall over its paved area gives **surface runoff**.
> Its inlets feed a drainage node whose pipes have a rated **capacity**.
> The moment runoff exceeds capacity, the **excess water** has nowhere to go.
> Terrain decides how much of it stays — and that becomes **water depth on
> the street**, in centimetres, with a risk class."

*(Point at the left panel, then the map.)*

---

## 01:15 – 01:40 · Graph-Based Drainage Model (25 s)

> "The drainage network is the core of the model — and it is a **directed
> graph**, exactly as the problem statement asks. Manholes and inlets are
> **nodes**. Underground pipes are **directed edges with carrying
> capacity** — 14 nodes, 15 pipes for this ward, flowing by gravity to the
> Pallikaranai outfall."

*(Open **Drainage Graph View**. Point at node IDs and capacity bars.)*

> "Every prediction you're about to see reads capacity from this graph —
> direction matters, because water only flows downhill."

*(Close the modal.)*

---

## 01:40 – 02:10 · Live Dashboard Demo (30 s)

> "Now the demo. This is live — every number recomputes as I move."

- **Drag slider to Cloudburst 75.** "Watch the corridors flip from green to
  orange and red — each road coloured by its own runoff-versus-drain
  calculation, not a blanket alert."
- **Click +3 HR.** "The nowcast horizon: the same storm, three hours later —
  fifteen corridors now severe, the alert feed updating itself, max depth
  over thirty centimetres."
- **Click Auto-Play, let one cycle run, pause.** "For a control-room screen,
  the whole 0–3 hour window plays itself."

*(Reset to Default afterwards.)*

---

## 02:10 – 02:25 · Road Intelligence — Explainability (15 s)

*(Click the worst road on the map or an alert in the feed — the map flies in
and the panel slides open.)*

> "Judges ask: why should we trust a number? Click any road. DrainCast shows
> its entire audit trail — catchment, runoff, inlets, the exact drainage node,
  pipe capacity, the excess, terrain influence — and then answers the
  question in plain language: *why is this road at this risk?* Every
  prediction is a sentence a corporation engineer can verify."

---

## 02:25 – 02:40 · Flood-Safe Routing & Usage (15 s)

*(Open the **Route Finder**, click Find.)*

> "And the part citizens feel. The cyan route is flood-aware — it costs
  flooded roads heavily in the path search. The dashed red one is the
  conventional shortest path, straight through the water. Same origin,
  same destination — the difference is the nowcast. Emergency services get
  this as a routing answer, not a colour."

---

## 02:40 – 03:00 · USP, Feasibility, Impact, Close (20 s)

> "Our USP: **DrainCast is the only entry point that couples all three
  systems — rainfall, directed drainage graph and terrain — into an
  explainable street-level depth forecast with routing built in.**
>
> Feasibility: every input already exists — IMD radar nowcasts, GCC drain
  asset registers, open DEMs. This ward took days; a city takes data, not
  new science. The full-stack architecture is designed and documented —
  the backend you saw in the repo is production-shaped.
>
> Impact: a municipality that knows *which* 15 roads will flood in the next
> three hours prepositions pumps, closes underpasses, and warns street-level
> — not city-level.
>
> DrainCast: know which streets will flood — before they do. Thank you."

---

## Speaker Notes & Tips

- **Timing anchors:** if you're at the dashboard by 00:55 and done with
  auto-play by 02:10, you're on pace. Cut the auto-play line first if
  running over — never cut the WHY panel.
- **Calm beats fast.** Pause one full second after "street-level flood
  prediction does not" and after the closing line.
- **Never apologize for demo mode.** If asked about live data, that's the
  designed answer in the Q&A doc, not a weakness to hide.
- **Rehearse the fly-to.** Click the alert, not the road, for the WHY panel —
  it shows off the map animation and the alert feed in one motion.
- **If the venue internet dies:** the app is fully client-side — tiles may go
  blank but every road, colour, number and route still renders on the dark
  canvas. Say so confidently if it happens; it's actually a feature.
