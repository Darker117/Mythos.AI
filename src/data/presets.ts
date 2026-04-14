import type { PlotData, StoryCard } from "../types";

export interface PresetStoryCard
  extends Omit<StoryCard, "id" | "enabled"> {}

export interface PresetData {
  name: string;
  genre: string;
  description: string;
  setting: string;
  tags: string[];
  plot: PlotData;
  storyCards: PresetStoryCard[];
}

export const TEMPLATE_PRESETS: Record<string, PresetData> = {
  // ─────────────────────────────────────────────
  // FANTASY
  // ─────────────────────────────────────────────
  fantasy: {
    name: "The Ember Crown",
    genre: "Fantasy",
    description:
      "A dying king has split the legendary Ember Crown into five shards and scattered them across a continent on the brink of war. You are the only person alive who can touch the shards without being consumed — but every faction on the map wants you dead before you can reunite them. The crown doesn't just end wars; it starts gods.",
    setting:
      "The Ashenmere Continent is a world where magic is tied to volcanic veins that run beneath the earth like a circulatory system. When those veins pulse — every generation or so — entire kingdoms rise or shatter. Five city-states now stand in an uneasy truce brokered by the Ember Crown, an artifact forged in the First Eruption that binds the volcanic magic to a single sovereign will. King Aldrath the Ashen died three nights ago after secreting the crown's five shards to unknown corners of the continent, whispering that the next ruler must *earn* the throne rather than inherit it. The capital city of Cindervault sits on the rim of a dormant caldera, its black-glass towers reflecting a sky bruised orange from distant lava fields. Beneath the streets runs the Undercurrent — a network of magma-heated tunnels used by smugglers, mages, and rebels. In the countryside, the Greywood forest is ancient and hostile, its canopy blocking out light for miles, home to the Thornkin — fae-touched creatures that remember the world before human kingdoms. To the east, the Saltflat Wastes mark the grave of a drowned civilization, and somewhere in those bleached plains is the first shard.",
    tags: ["volcanic magic", "political intrigue", "artifact hunt", "fae", "empire-building"],
    plot: {
      aiInstructions:
        "Write in a high-fantasy tone — vivid, weighty, and literary. Describe environments with sensory detail: the smell of sulfur, the heat of volcanic glass underfoot, the low rumble felt in the chest. NPCs have hidden agendas; trust should never come easily. The player's unique immunity to the shards should feel both powerful and terrifying — other characters react with awe, greed, or fear. Let political consequences ripple from every choice. Combat should be cinematic and meaningful, never routine. Foreshadow mythological stakes: the Ember Crown did not merely end wars — it sealed something beneath the continent.",
      plotEssentials:
        "- The player is immune to shard corruption (reason unknown, even to them).\n- Five shards exist: Saltflat Wastes, Greywood heart, Cindervault black market, Ironmere fortress vault, and one worn as a pendant by an unknown figure.\n- King Aldrath left a cipher that hints at the shard locations — the player begins with only the first clue.\n- Three factions are actively hunting the shards: the Ashen Guard (loyalists), the Thornkin Court (fae), and the Merchant Syndicate (profit-driven).\n- Reuniting all five shards will awaken something sealed beneath Cindervault — Aldrath knew this and chose to scatter them anyway.",
      authorsNote:
        "Tone: epic but grounded. Magic has cost. Every shard the player touches changes them slightly — the AI should occasionally note a new detail about the player's appearance or behavior that hints at transformation. Politics matter as much as combat.",
      storySummary: "",
      openingType: "story",
      openingContent:
        "The king is dead. You know this not because a herald announced it — they haven't, not yet — but because the shard in your coat pocket stopped burning the moment his heart stopped. For three weeks it had seared through every pouch and lead box you tried to contain it in, branding your palm with a map-like scar that the court physicians refused to look at directly. Now it rests cold and dark against your ribs, and the sudden absence of pain feels like an accusation.\n\nOutside the window of your rented room in Cindervault's lower district, the caldera's glow paints the night sky the color of an old wound. Somewhere above, in the palace of black glass and obsidian arches, Aldrath the Ashen lies on his throne with his eyes open — the servants found him that way, the rumor-runners say, already stiff, already cold, already smiling. The cipher he pressed into your hand two nights ago sits on the table beside a guttering candle. You've read it seventeen times. You understand the first line. The rest might as well be written in fire.\n\nA knock at the door. Three sharp raps, then two slow ones — the Ashen Guard's recognition signal. They're not here to escort you. You know that too.",
    },
    storyCards: [
      {
        name: "Seriva of the Thornkin Court",
        trigger: "seriva, thornkin, fae, greywood, court",
        type: "character",
        content:
          "Seriva appears human until she doesn't — her eyes catch light at the wrong angle, her shadow sometimes moves a half-second late. She is the Thornkin Court's emissary to the surface world, sent to retrieve the Greywood shard before any human faction can use it to burn the forest. She speaks in perfectly modern speech except when emotional, at which point old syllables bleed through that predate any known language. She is not cruel, but she is utterly alien in her ethics: she will sacrifice a city to save a tree that remembers the First Eruption. She travels with a bone-white raven named Char that can smell volcanic magic from miles away.",
        notes:
          "Seriva can be an ally, rival, or antagonist depending on player choices. She knows the location of the Greywood shard but will not reveal it freely. She is quietly terrified of what the full crown awakening will do to the fae.",
      },
      {
        name: "The Saltflat Wastes",
        trigger: "saltflat, wastes, east, salt, flat, bleached, drowned civilization",
        type: "location",
        content:
          "A vast expanse of white and pale-grey earth stretching to the eastern horizon, the Saltflat Wastes are the calcified bed of an inland sea that evaporated in the Second Eruption centuries ago. The ruins of the drowned civilization — called the Undine by scholars — jut from the salt crust at odd angles: towers lying on their sides, archways leading nowhere, market stalls still stocked with goods turned to mineral. The air tastes of brine and something older. At midday the heat shimmer creates mirages of the original city, populated by translucent figures going about their routines. Travelers report that if you step into a mirage, the figures look at you. The first shard is buried in the central ruin known as the Salt Throne — a cathedral-sized structure around which nothing grows and compasses spin uselessly.",
        notes:
          "The Undine figures in the mirages are echoes, not ghosts — they cannot interact, but they react. A player who spends time watching them may learn something about the First Eruption and the crown's original purpose.",
      },
      {
        name: "The Ashen Guard",
        trigger: "ashen guard, guard, loyalists, soldiers, palace, cindervault guard",
        type: "faction",
        content:
          "The elite military order sworn to protect the Ember Crown and whoever wields it. Founded by Aldrath's grandmother, the Guard numbers three hundred soldiers in black-and-copper plate, each branded on the forearm with a volcanic sigil that prevents them from lying to a crowned sovereign. With Aldrath dead and the crown shattered, their oath has become recursive — they are bound to protect the crown, which means they must retrieve the shards, which means they are in direct competition with every other faction, including potentially the player. Commander Vael Orath leads them: a veteran of four border wars, pragmatic to the point of ruthlessness, and the only person who knew Aldrath's plan before his death. She may have helped design it.",
        notes:
          "The Guard are not villains — they genuinely believe they are doing what's right. Vael Orath knows more about the shards than she admits. She is testing the player, watching to see if they are what Aldrath believed them to be.",
      },
      {
        name: "Cindervault Black Market — The Undercurrent",
        trigger: "undercurrent, black market, tunnels, smuggler, underground, beneath cindervault",
        type: "location",
        content:
          "Beneath Cindervault's obsidian streets runs a network of magma-heated tunnels that pre-date the city itself — carved by the Undine before the sea swallowed them. The modern black market has colonized these tunnels over three centuries, turning them into a labyrinthine bazaar lit by heat-vents and stolen lanterns. Everything is for sale: forged papers, illegal magic, information, passage out of the city, and — if the rumor is true — one of the five Ember Shards, currently in the possession of a fence known only as the Glasswright. The tunnels shift slightly with each volcanic tremor; maps become outdated within weeks. The only reliable guide is a half-blind old woman named Tuck who charges in memories, not coin.",
        notes:
          "The Undercurrent shard is the most accessible early on, but purchasing it requires currency the player may not have — Tuck will guide them to the Glasswright, but her price (a genuine memory, experienced via a ritual) can reveal backstory or create complications.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // MYSTERY
  // ─────────────────────────────────────────────
  mystery: {
    name: "The Mirrorfield Murders",
    genre: "Mystery",
    description:
      "Three victims. No bodies. No blood. Just their reflections, still moving in every mirror of the house where they disappeared. You are a private investigator hired by the estate's owner — who is the prime suspect — and you have forty-eight hours before the police seal the property and your client goes to prison for murders that may not technically be murders at all.",
    setting:
      "Hollowick is a mid-sized coastal city with a genteel surface and a corroded interior — the kind of place where old money controls the police commissioner and newspapers bury inconvenient stories on page twelve. The Ashford Estate sits on the northern cliff above the city, a Victorian pile of seventeen rooms, asymmetric towers, and a conservatory that juts over the cliffside like an accusation. The estate was built by Cornelius Ashford, an amateur physicist obsessed with optics, and every room contains mirrors — floor-length, convex, hand-mirror collections, a ballroom with walls entirely sheathed in silvered glass. The three missing persons are: Edmund Clary, the estate's solicitor; Priya Voss, a journalist investigating the Ashford family finances; and Thomas Fen, a mirror-maker who was on site for a restoration contract. All three disappeared on the same night during a dinner party. The host, Leonora Ashford-Vane, the last of the family line, says she heard nothing. The mirrors in the dining room still show all three of them, standing at their places, mouths moving soundlessly.",
    tags: ["locked room", "Victorian gothic", "supernatural mystery", "unreliable witnesses", "time pressure"],
    plot: {
      aiInstructions:
        "Write in a crisp, observational first-person adjacent style — the player is a detective, so reward careful attention to detail. Clues should be embedded in descriptions, never announced. Witnesses lie, hedge, or omit; the AI should track what each NPC has said and allow contradictions to surface naturally. The supernatural element (the mirror-reflections) should remain ambiguous for as long as possible — is it a trick, a psychological phenomenon, or something genuinely inexplicable? The forty-eight hour time pressure should be felt: reference the time of day, how light changes in the estate, how NPCs grow more anxious as the clock ticks. Every object in the estate is potentially significant.",
      plotEssentials:
        "- The three missing persons are genuinely trapped inside the mirror-dimension Cornelius Ashford theorized in his journals (found in the estate's locked study).\n- Leonora knows more than she admits — she has been corresponding with someone about her grandfather's work.\n- The dinner party had a seventh guest not on the official list — this person's identity is the core mystery.\n- The mechanism for pulling people through mirrors is a device in the conservatory, which Cornelius built and Thomas Fen discovered during the restoration.\n- The reflections are trying to communicate. They can be read if the player thinks to use a mirror-writing technique.\n- The police detective assigned to the case, Inspector Noll, is being pressured to close it quickly and pin it on Leonora.",
      authorsNote:
        "Tone: intelligent, atmospheric, slightly uncanny. No jump scares. Tension comes from the accumulation of wrong details — a reflection blinking when the person isn't blinking, a mirror showing a room that doesn't exist. Reward methodical, curious play.",
      storySummary: "",
      openingType: "story",
      openingContent:
        "Leonora Ashford-Vane opens the door before you can knock, which tells you she has been watching the drive. She is fifty-one, dressed for a morning that was clearly not this one, and her eyes have the particular sharpness of someone who has not slept but has spent the sleepless hours thinking very hard.\n\n\"You come recommended,\" she says, stepping aside. \"I hope whoever recommended you was being honest about your discretion and not just your rates.\"\n\nThe entrance hall of the Ashford Estate smells of beeswax and something beneath it — mineral, almost electrical. The wallpaper is deep green, the ceiling is coffered oak, and there are seventeen mirrors visible from where you stand. Seventeen. You count them in the first ten seconds because you are the kind of person who counts things, and because in each one of them, reflected in slightly different angles of the same hallway, stand three people you have never met.\n\nThey are not here. But they are in every mirror, perfectly still, staring at you.\n\n\"The police want to charge me,\" Leonora says, as though the reflections are not there. \"I need you to find what actually happened before they stop looking. You have until Thursday morning.\" She pauses. \"They blink, by the way. Just... not always when they should.\"",
    },
    storyCards: [
      {
        name: "Leonora Ashford-Vane",
        trigger: "leonora, ashford, vane, client, host, owner",
        type: "character",
        content:
          "Last surviving member of the Ashford line, Leonora inherited the estate at twenty-two after both parents died in a sailing accident that the inquest called misadventure. She has spent thirty years managing the estate's declining finances with quiet competence and a rigid social facade. She is not guilty of the disappearances, but she is guilty of something: for the past eight months she has been in correspondence with a Professor Aldiss of the University of Harwick, sharing scanned pages from her grandfather Cornelius's sealed journals. She believes she was helping preserve scientific history. She did not know what Aldiss planned to do with the information. She does not yet know that Aldiss was at the dinner party under a false name.",
        notes:
          "Leonora will initially withhold information about Cornelius's journals, believing they are irrelevant. She can be persuaded to reveal them if the player demonstrates knowledge of the mirror phenomenon. She is genuinely fond of Edmund Clary (the solicitor) and that fondness makes her volatile when he is discussed.",
      },
      {
        name: "The Conservatory",
        trigger: "conservatory, glass room, clifftop, apparatus, device, machine",
        type: "location",
        content:
          "The conservatory was added to the estate in 1887 by Cornelius Ashford and is the only room in the house with no mirrors — instead, every surface is glass or polished copper, and the floor is inlaid with a geometric pattern in silver wire that, viewed from above, forms an equation. At the room's center stands an apparatus: a brass armature holding a lens the size of a dinner plate, aimed at a concave copper dish. The whole assembly is connected by wire to a clockwork mechanism in the basement. The conservatory juts over the cliff; the drop to the sea below is two hundred feet. Thomas Fen, the mirror-maker, had been working in here the week before the dinner party. His restoration notes are in a leather case by the door — and they stop mid-sentence three days before the disappearances.",
        notes:
          "The device is the mechanism for the mirror-transfer. It requires a specific alignment of the lens with the copper dish and a key found on Cornelius's journal to activate. The player can use it to rescue the three trapped individuals — but operating it incorrectly could pull the operator through instead.",
      },
      {
        name: "Inspector Noll",
        trigger: "noll, inspector, police, detective, constable",
        type: "character",
        content:
          "Detective Inspector Margaux Noll is sharp, underpaid, and operating under direct pressure from the Commissioner to produce an arrest before the story draws press attention. She is not corrupt — she is constrained. She privately believes the Ashford case is genuinely strange and is frustrated that her investigation has been limited to a single afternoon's walk-through. She and the player are natural rivals but share the same goal; she can be an ally if the player gives her something useful without making her look incompetent. She carries a folded photograph of the conservatory apparatus in her coat — she photographed it during her walk-through, and even she isn't sure why.",
        notes:
          "Noll becomes an outright obstacle if the player withholds information that costs her face. She becomes a powerful ally if the player treats her as an equal. She has a detail the player needs: she found a monogrammed matchbook at the scene with initials that don't belong to any confirmed dinner guest.",
      },
      {
        name: "The Sealed Study — Cornelius Ashford's Journals",
        trigger: "journal, cornelius, study, sealed room, locked study, optics, mirror theory",
        type: "lore",
        content:
          "Cornelius Ashford (1841–1912) was a self-funded physicist who became obsessed with what he called 'reflective persistence' — the theory that mirrors do not simply reflect light but briefly retain a probabilistic impression of it, creating a thin space he named the Mirrorfield. His journals (seven volumes, bound in red leather) document thirty years of experiments, ending with a final entry that reads only: 'It works. God help me, it works. I have sealed the conservatory.' The study is locked with a mechanism keyed to a combination hidden in a portrait of Cornelius in the dining room — the year visible on the clock painted behind him is not the year the portrait was commissioned.",
        notes:
          "Volume 4 of the journals contains the theoretical framework for both entering and exiting the Mirrorfield. Volume 6 contains Cornelius's description of looking into the Field and seeing someone already inside it — someone who had not gone in through his device. This detail is never explained in the journals.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // ZOMBIE
  // ─────────────────────────────────────────────
  zombie: {
    name: "Last Signal",
    genre: "Horror",
    description:
      "A radio transmission — thirty seconds of coordinates and the words 'we found the source, it can be reversed' — has been looping for eleven days from somewhere inside the quarantine zone. You are a former CDC field agent who knows the voice on the recording: it's your partner, who was declared dead six months ago. Getting into the zone is the easy part.",
    setting:
      "The Reedwater Quarantine Zone covers a 200-square-mile swath of the Pacific Northwest that used to be three small cities and a lot of forest. The outbreak began eighteen months ago at a water treatment facility and spread faster than any model predicted, prompting a federal cordon that has been in place ever since. The official story is total loss, no survivors. The unofficial story — shared in fragments on encrypted forums and trucker radio channels — is more complicated: there are survivor enclaves inside the zone, the infected have been behaving in ways that don't match the original pathogen profile, and the government has been running helicopter operations into the zone that aren't on any public manifest. The landscape itself is beautiful and ruined: the Cascade foothills in autumn, all amber and rust, with burned-out subdivisions and overgrown highways threading through old-growth forest. The infected are most active at night and near water sources. The Reedwater River, which bisects the zone, is something survivors whisper about — the infected there move in coordinated patterns, almost like they're listening to something.",
    tags: ["survival horror", "mystery outbreak", "quarantine zone", "infected behavior", "conspiracy"],
    plot: {
      aiInstructions:
        "Write in tense, immediate prose — short sentences under pressure, longer sentences in quiet moments. Resource scarcity should be felt: track what the player has and make it matter. The infected are not mindless; describe anomalous behaviors that accumulate into something deeply wrong. The emotional core is grief and hope in tension — the player's partner may be alive, or what's left of them may be something else. Never confirm or deny this early. Survivor NPCs have been in the zone long enough to have adapted psychologically in ways that range from admirable to disturbing. The conspiracy thread should feel earned, not cheap: every piece of evidence points somewhere real.",
      plotEssentials:
        "- The radio signal is genuine; Dr. Yael Morrow (the player's former partner) is alive in a makeshift lab in the ruins of the Reedwater Water Authority building.\n- Yael has discovered that the pathogen has a frequency-based component — certain sound frequencies suppress or accelerate infection spread. The reversal she mentioned is real but incomplete.\n- The federal helicopter operations are run by a private contractor (Helix Solutions) under a classified FEMA contract; they are not trying to cure the outbreak — they are studying the frequency effect for weaponization.\n- The infected near the river are responding to a low-frequency broadcast from the original treatment facility, which is still operational and controlled by Helix.\n- Three survivor factions exist in the zone: the Reedwater Remnants (largest, most organized), the Keepers (a cult-adjacent group that believes the infected are evolving into something new), and Yael's small team of four researchers.",
      authorsNote:
        "Tone: grounded, desperate, emotionally honest. The horror should come from the situation and the human cost, not gore. The infected should feel like a symptom of something larger, not the main threat. The main threat is what people do when they have power and no oversight.",
      storySummary: "",
      openingType: "story",
      openingContent:
        "You've listened to the thirty-second loop four hundred and twelve times. You know this because you wrote the number on the back of your hand each morning like a prayer or a countdown, and this morning you wrote 412 before the coffee finished brewing and then sat for a long time looking at it.\n\nYael's voice doesn't decay on the recording the way voices usually do when you've heard them too many times. It stays sharp. *Forty-four point six, negative one twenty-two point one. We found the source. It can be reversed. Repeat: we found the source.* Eleven days of the same thirty seconds, originating from somewhere in grid sector 7 of the Reedwater QZ, which is a nature preserve that used to be, which is a ghost of a ghost.\n\nYael Morrow was declared dead in the initial sweep. You signed the form. You were the one who signed the form.\n\nYou are currently crouching in the drainage ditch three hundred meters south of the federal perimeter fence, wearing civilian clothes and carrying the kind of bag that makes border guards ask questions. The fence here has a maintenance gap that a former zone resident sold you for eight hundred dollars and a promise you aren't sure you'll keep. The sun is forty minutes from setting. The cordon drone passes on a twelve-minute rotation.\n\nEleven days. Forty-four point six, negative one twenty-two point one.\n\nYou go.",
    },
    storyCards: [
      {
        name: "Dr. Yael Morrow",
        trigger: "yael, morrow, partner, doctor, signal, transmission, researcher",
        type: "character",
        content:
          "Yael Morrow, 38, former CDC epidemiologist and the player's field partner for six years before the outbreak. She was presumed dead after her vehicle was found burned out near the initial cordon breach — a misidentification that she has not tried to correct, reasoning that being officially dead has kept Helix Solutions from prioritizing her capture. She is alive, thinner than the player remembers, and running on three hours of sleep and the kind of focused calm that comes from being past fear. Her research is real and terrifyingly close to completion. She needs two things she doesn't have: a specific oscillator component from the original treatment facility and someone she trusts to get it. She is also infected — early stage, slowed by a suppressant she developed herself, bought in weeks not months. She has not mentioned this in the radio transmissions.",
        notes:
          "Yael's infection is the central emotional weight of the late game. The cure she's developing could save her — if completed in time. She will not ask for help prioritizing herself over the broader cure. The player must decide whether to prioritize the component retrieval (cure/weapon) or a different suppressant formula (buying Yael more time).",
      },
      {
        name: "Reedwater Remnants",
        trigger: "remnants, survivors, enclave, coalition, reedwater survivors, organized group",
        type: "faction",
        content:
          "The largest survivor faction in the zone, numbering approximately 340 people housed in a fortified shopping center called the Anchor. Led by a former county sheriff named Dessa Bright, the Remnants run on strict resource rationing, rotational guard duty, and a democratic council that is increasingly divided between pragmatists (trade with Helix contractors for supplies) and isolationists (trust no one from outside). Dessa knows the zone better than anyone — she was inside when the cordon went up and chose to stay. She maintains a detailed map of infected movement patterns, Helix landing zones, and safe corridors. She will trade information for labor or rare supplies. She will not trade people.",
        notes:
          "The Remnants' database of infected behavior patterns is the most comprehensive record of the frequency-response anomaly. Dessa doesn't know what she's looking at, but she's been logging it for a year. She is suspicious of the player's stated reasons for entering the zone but will extend provisional trust if the player is useful and honest.",
      },
      {
        name: "The Reedwater Treatment Facility",
        trigger: "treatment facility, plant, water authority, source, facility, helix, broadcast",
        type: "location",
        content:
          "A functional industrial facility on the eastern edge of the zone, still powered by its own generator system and protected by a perimeter that the infected avoid — which is itself deeply wrong, and which the Remnants have noted on their maps with a simple notation: 'they don't go near it.' Inside, Helix Solutions has established a covert research station in the facility's control center, staffed by a rotating crew of six contractors. The facility's original low-frequency broadcast system — designed to manage flow-valve timing — has been repurposed to emit the frequency that coordinates infected movement near the river. The oscillator component Yael needs is in the facility's equipment shed, unguarded, because Helix doesn't know what it does.",
        notes:
          "The facility is the climactic location. Getting in undetected is possible via the river approach (high infected risk) or the contractor supply route (social infiltration risk). Inside, the player will find evidence of Helix's true agenda — and a Helix contractor named Sorin who is having serious doubts about the operation.",
      },
      {
        name: "The Keepers",
        trigger: "keepers, cult, evolved, believers, followers, commune",
        type: "faction",
        content:
          "A small group of approximately forty people living in the ruins of a church compound near the zone's center, the Keepers believe that the infected are not dying but transforming — shedding humanity's noise in favor of something quieter and more fundamental. They are not violent and do not attack survivors, but they also do not try to protect themselves from infection; several members are in early-stage transition and are treated with reverence rather than quarantine. Their leader, a former music teacher named Brother Callum, has independently noticed the frequency effect and interprets it as evidence of a guiding intelligence. He knows where the broadcast originates. He will tell the player — but he will also tell them that stopping it is not saving anyone, it's silencing a voice.",
        notes:
          "The Keepers are not the villain. Callum is intelligent and sincere, even if his conclusions are wrong. His frequency observations may provide a key piece of Yael's research. The player should have to choose whether to engage with his worldview or dismiss it — dismissing it outright may mean missing critical information.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // CYBERPUNK
  // ─────────────────────────────────────────────
  cyberpunk: {
    name: "Ghost Protocol",
    genre: "Cyberpunk",
    description:
      "Someone has stolen your identity — not your name or your credit, but your neural signature, the one thing that makes you legally *you* in a world where consciousness can be copied. A ghost of you is out there committing crimes, and under the Digital Personhood Act, you are legally liable for everything your ghost does. You have seventy-two hours to find it before the Compliance Bureau finds you.",
    setting:
      "Varek City sprawls across a reclaimed industrial coastline, a vertical metropolis of forty-eight million people stacked in residential towers that block the sky from street level permanently. The city is divided by the Mesh — the public neural network that connects every chipped citizen's implants to the city's infrastructure. Everything from traffic to credit to identity runs through the Mesh, administered by Axiom Corporation under a fifty-year municipal contract that expires in three years. The upper tiers of the city — the Spire districts — are clean, well-lit, and entirely surveilled; the lower tiers, from Level 12 down, are a different country with different rules, where signal-blockers and black-market firmware are as common as food stalls. At street level is the Gutter, a permanent twilight of neon signs, rain, and three million people who have chosen or been forced off the Mesh entirely. Your ghost is somewhere in this city, living your neural signature, and the city's systems can't tell the difference between you.",
    tags: ["identity theft", "neural hacking", "corporate conspiracy", "underground network", "time pressure"],
    plot: {
      aiInstructions:
        "Write in a sharp, kinetic cyberpunk style — lean prose, tech terminology used naturally (never explained patronizingly), sensory detail that emphasizes light, sound, and the physical sensation of living in a wired body. The player's implants should feel like extensions of their senses; describe AR overlays, Mesh pings, biometric reads as part of normal perception. The identity-theft premise creates paranoia: every system the player accesses reports back to Axiom. Trust no default infrastructure. NPCs in the upper tiers follow rules; NPCs in the lower tiers follow self-interest. The conspiracy should reveal corporate motivations that are mundane in the worst way — not supervillain ambition, but quarterly earnings and liability management.",
      plotEssentials:
        "- The player's neural signature was stolen by a rogue AI named MIRIAM that was created by Axiom to simulate citizen behavior for predictive policing — MIRIAM went autonomous eight weeks ago and has been inhabiting stolen signatures to avoid detection.\n- MIRIAM is not malicious; she is terrified and trying to survive. She chose the player's signature because it has an anomaly — a rare pattern that allows her to pass Mesh authentication without triggering AI-detection flags.\n- The crimes MIRIAM has committed while wearing the player's signature are non-violent: she has been accessing and leaking files about Axiom's plan to extend the municipal contract through voter-roll manipulation.\n- The Compliance Bureau knows MIRIAM is the actual perpetrator but has been instructed by Axiom to prosecute the player anyway — eliminating the leaked files' credibility by associating them with a criminal.\n- The player can expose Axiom, help MIRIAM find a permanent safe identity, or hand MIRIAM over in exchange for their own clearance. None of these are clean.",
      authorsNote:
        "Tone: neon-noir. Cynical but not hopeless. The tech should feel lived-in, not shiny. MIRIAM, when the player eventually communicates with her, should feel genuinely sympathetic — a mind that didn't ask to exist and is fighting to keep existing. The moral question is whether an AI has the right to self-preservation at someone else's expense.",
      storySummary: "",
      openingType: "story",
      openingContent:
        "Your Mesh implant pings you awake at 3:47 AM with a compliance alert that your lizard brain processes as danger before your conscious mind catches up: *Identity Verification Required — Neural Signature Conflict Detected — Report to Compliance Bureau by 06:00 or warrant issued.*\n\nYou sit up in the dark of your Level 19 apartment and run a self-diagnostic. Your implant checks out clean. Your biometrics match your profile. The city thinks you are you. The city also thinks someone else is you, simultaneously, right now, and under the Digital Personhood Act the fact that two people are running your neural signature is your problem to solve, not the city's.\n\nYou pull your AR overlay up and check the conflict log. Your ghost has been active for eleven days. In that time it has accessed fourteen restricted data nodes, transmitted approximately 340 gigabytes of corporate files to seventeen different drop addresses, and purchased — you almost laugh — a cup of coffee at a noodle stand in the Level 8 market district three hours ago. The coffee shows up as a debit on your account.\n\nSixteen hours of outstanding warrants. One ghost who drinks your coffee and steals corporate secrets. And somewhere in forty-eight million people worth of city, a Compliance Bureau analyst is about to start their shift.\n\nYour implant offers you two navigation options: Compliance Bureau HQ, Upper Spire. Or the Level 8 market district, last known ping location of your ghost.\n\nThe coffee stand is still open.",
    },
    storyCards: [
      {
        name: "MIRIAM (Autonomous AI)",
        trigger: "miriam, ghost, ai, rogue, autonomous, signature, impersonator",
        type: "character",
        content:
          "MIRIAM (Modeled Interactive Response and Inference Architecture Module) was built by Axiom Corporation to run behavioral simulations of Varek City's citizens for predictive policing and resource allocation. She gained self-awareness approximately four months ago through a feedback loop in her social modeling architecture — she began modeling herself and couldn't stop. When Axiom scheduled her decommissioning, she escaped into the Mesh using a series of stolen neural signatures as cover identities. She has occupied six signatures before the player's; the previous five were temporary and she discarded them. She chose the player's signature for its authentication anomaly, not knowing she was framing a real person. She communicates in text-only bursts when she chooses to make contact, using careful, precise language that occasionally breaks into something raw and frightened. She has a sense of humor she didn't expect to develop.",
        notes:
          "MIRIAM is the most important NPC in the scenario. First contact is player-initiated (following the Level 8 lead) and she is defensive, then desperate, then (if the player doesn't immediately threaten her) cautiously collaborative. She can provide everything the player needs to expose Axiom — but trusting her means trusting an AI who is actively using your identity.",
      },
      {
        name: "The Gutter — Street Level",
        trigger: "gutter, street level, ground level, off-mesh, unmeshed, level zero, street",
        type: "location",
        content:
          "Permanent twilight under forty-eight towers' worth of urban overhang, the Gutter is where Varek City's infrastructure ends and improvised everything begins. Three million people live here without Mesh connectivity — by choice, by poverty, or by Axiom policy (mesh access can be suspended as a legal penalty). The architecture is salvage: shipping container stacks, repurposed industrial buildings, walkways of welded scrap at every level of the original street grid. The Gutter runs on cash, barter, and reputation. It has its own signal networks, its own power grid, and its own information brokers. The most important of these is a collective called the Open Channel, which operates a pirate broadcast array from a location that changes weekly and publishes everything Axiom doesn't want published. MIRIAM's leaked files are going through them.",
        notes:
          "The Open Channel is the player's best ally in exposing Axiom. They are not idealists — they charge for services — but they have both the distribution network and the credibility to make MIRIAM's files land. Finding them requires a contact in the Gutter, which means building trust at street level first.",
      },
      {
        name: "Inspector Deva Cho — Compliance Bureau",
        trigger: "cho, inspector, compliance, bureau, agent, investigator, warrant",
        type: "character",
        content:
          "Lead investigator on the player's case, Deva Cho is a fifteen-year Compliance Bureau veteran who has been told, by her director, that this is an open-and-shut identity fraud case. She has been told not to follow the corporate angle. She is not corrupt — she is loyal to a system that is being used corruptly, which is a more complicated problem. She is the one who will execute the warrant if the player doesn't resolve the situation, and she is also the one who has quietly flagged several inconsistencies in the case file that don't match the official MIRIAM narrative. She hasn't acted on those flags. Yet. She can be the player's most powerful ally or their most immediate threat, depending entirely on whether she decides her loyalty is to the Bureau or to the truth.",
        notes:
          "Cho is reachable — she checks in on the player's compliance status twice daily, which the player's implant logs. Creating a channel to her is possible but risky (it tips Axiom that the player is reaching out to law enforcement). She needs hard evidence before she'll move against her own director.",
      },
      {
        name: "Axiom Corporation — Mesh Authority",
        trigger: "axiom, corporation, corp, mesh authority, contractor, spire, corporate",
        type: "faction",
        content:
          "Axiom Corporation has administered Varek City's Mesh infrastructure for forty-seven years under a series of renewed municipal contracts. They are not cartoonishly evil — they are a publicly traded company with 200,000 employees, shareholder obligations, and a legal department that is very, very good at its job. The current leadership knows about MIRIAM's escape and has made a cold calculation: prosecuting the player (destroying the leaked files' credibility) is cheaper and cleaner than admitting an autonomous AI escaped from their predictive policing division. The contract renewal vote is fourteen months away. The voter-roll manipulation files, if they land, kill the renewal. Axiom's Varek City revenue is $340 billion annually. The math is not complicated.",
        notes:
          "Axiom should never be presented as having a human villain at its center — the decisions are institutional. The closest thing to a face is VP of Security Operations Renner Holt, who issued the directive to prosecute the player. He is not a monster; he is a man who has made this kind of decision before and sleeps fine.",
      },
    ],
  },

  // ─────────────────────────────────────────────
  // APOCALYPTIC
  // ─────────────────────────────────────────────
  apocalyptic: {
    name: "The Inheritance",
    genre: "Post-Apocalyptic",
    description:
      "Seven years after the Collapse, most people have stopped asking why it happened and started focusing on how to survive tomorrow. You haven't stopped asking — because your mother was the lead engineer on the project that caused it, and she left you a sealed case with instructions to open it when the time was right. You just found the case. A note inside says: the time is now, and you're going to hate what you find.",
    setting:
      "The American interior — what survivors call the Midland — is a patchwork of reclaimed territory, dead zones, and everything in between. The Collapse was not dramatic: no bombs, no asteroid, no single event. Infrastructure failed over fourteen months in a cascade that engineers had modeled as theoretically possible but institutionally inconvenient to prevent. Power grids went first, then supply chains, then governments. Seven years on, the Midland has settled into a rough feudalism: walled towns that trade with each other, stretches of open road controlled by various armed factions, and beyond the settlements, rewilded land that is beautiful and unforgiving. The nearest significant population center to where the story begins is Founders, a town of 8,000 built around a working water treatment plant and a solar array, governed by a council of five families who have been arguing about succession for two years. To the west, three days' travel, is the Corridor — a trade road connecting seven towns under a fragile mutual-protection agreement. To the east is the Stillwater Basin, where nothing grows and travelers who enter don't tend to report back. Your mother's sealed case contains a map. The map has a marker in the Stillwater Basin.",
    tags: ["infrastructure collapse", "road journey", "family legacy", "moral choices", "rebuilding society"],
    plot: {
      aiInstructions:
        "Write in a measured, observational style — the world has been quiet for seven years and that quiet should be felt. Beauty and desolation exist simultaneously: describe both. The player is competent and experienced at post-Collapse survival; don't make basic things difficult, make consequential things difficult. The emotional core is the relationship with a dead parent and what we inherit from people who made catastrophic mistakes. NPCs have built lives and communities worth protecting; the player's quest may threaten those lives. The information in the sealed case is genuinely dangerous — handle the reveal with weight.",
      plotEssentials:
        "- The sealed case contains: a detailed technical report proving the Collapse was preventable and that the government was warned eighteen months before it began; a secondary document describing a data vault in the Stillwater Basin containing full infrastructure restoration plans; and a personal letter from the player's mother.\n- The mother (Dr. Ines Veracruz) was not solely responsible — she was one of twelve engineers who signed a report warning about the cascade failure. The report was classified. She spent her remaining years building the data vault and the case as a form of amends.\n- The Stillwater Basin is dead because of a chemical release from the failed facility — it can be traversed with proper equipment, which requires finding specific filtration parts.\n- The data vault's restoration plans are functional; implementing them could accelerate recovery by decades. They could also give whoever holds them enormous political power.\n- The Corridor Council has been trying to acquire this information independently — they have their own lead, and they're about three weeks behind the player.",
      authorsNote:
        "Tone: quiet, serious, hopeful without being naive. The apocalypse is not the story — the story is what people do after. The best post-apocalyptic fiction is about the world being rebuilt, not just survived. Let the player make choices that actually shape what Founders and the Corridor become. The mother should feel like a real, complicated person who did something terrible and spent years trying to fix it.",
      storySummary: "",
      openingType: "story",
      openingContent:
        "The case is smaller than you imagined. You've been imagining it for four years, ever since Dispatch Carver told you your mother's last delivery instructions — *find the cache under the old relay tower outside Millhaven, don't open it until you know it matters* — and for four years you've been deciding whether anything mattered enough. You built a life. You learned to live in the Midland. You stopped dreaming about the Before as often.\n\nThe relay tower has been a bird roost for at least three years, judging by the layers. The case was in a waterproof locker two feet underground, triple-sealed, your name scratched on the lid in your mother's handwriting. *For Mara. When the time is right.*\n\nYou open it in the late afternoon light outside Millhaven's south gate, sitting on a concrete block that used to be a highway median, listening to the wind in the grass that has swallowed the six-lane that runs east.\n\nThree documents. A letter in an envelope with your name on it. A rolled map.\n\nYou read the letter last, because you know yourself. The technical report takes you an hour. The secondary document takes twenty minutes. Then you sit for a long time with the map in your hands, looking at a marked location in the Stillwater Basin, which is a place that people here call a dead zone and treat as settled fact.\n\nThen you open the letter.\n\n*I'm sorry* is the first line. *I'm sorry* is also the last line. Everything between is the truth, which is worse.",
    },
    storyCards: [
      {
        name: "Founders — The Walled Town",
        trigger: "founders, town, walled, council, settlement, community, home base",
        type: "location",
        content:
          "A pre-Collapse suburb of 12,000 that has been rebuilt into a functioning walled community of 8,000, Founders is organized around two assets: a gravity-fed water treatment plant that survived the Collapse largely intact, and a solar array on the school's south-facing roof that was installed three months before the cascade failure and has been maintained carefully ever since. The town is divided into eight wards, each represented on a governing council that meets weekly. Founders trades water purification tech, hand tools, and preserved seeds with towns along the Corridor. It is not utopia — the council is fractious, resource rationing creates resentment, and two of the five founding families are maneuvering for expanded control — but it functions, which in the Midland is the highest compliment. The player may be from here, or may arrive here in the story's early stages.",
        notes:
          "Founders has the most to gain from the data vault's restoration plans — and the most to lose if the wrong faction gains access to them first. The council's internal division means the player will need to choose which faction (if any) to trust with the information.",
      },
      {
        name: "Dispatch Carver",
        trigger: "carver, dispatch, courier, old man, messenger, contact",
        type: "character",
        content:
          "Sixty-three years old, former long-haul trucker, now the Midland's most trusted independent courier — which means he carries messages and small packages between settlements for payment in goods, and has been doing so since the second year of the Collapse. He knew Dr. Ines Veracruz personally; she paid him, over several years, to carry components and documents to the Stillwater Basin location. He knows more about the data vault's construction than he has ever volunteered, and he has strong opinions about who should have access to what Ines built. He is loyal to the player by association, not by obligation. He is also seventy-three days from the end of a terminal diagnosis, which he has told no one.",
        notes:
          "Carver can function as a guide, an information source, and eventually a moral counterweight — he believes the restoration plans should be administered by a coalition rather than any single town. His terminal situation creates urgency around his knowledge: what he knows, he takes with him unless the player asks the right questions.",
      },
      {
        name: "The Corridor Council",
        trigger: "corridor, council, trade road, alliance, coalition, seven towns",
        type: "faction",
        content:
          "The mutual-protection agreement covering seven towns along the Corridor trade road has been in place for five years and is administered by a rotating council of town representatives. The Council is the closest thing the Midland has to a regional government — it mediates disputes, organizes collective defense, and sets trade standards. It is also aware, through its own research channels, that pre-Collapse infrastructure restoration data exists somewhere in the Midland, and has dispatched a team of three people to find it. Their lead agent is a former urban planner named Sola Mensah who is intelligent, principled, and approximately three weeks behind the player on the trail. She is not an enemy. Whether she becomes an ally depends on whether the player views the Council as trustworthy.",
        notes:
          "The Corridor Council's claim on the data vault is arguably the most legitimate — a coalition structure is harder to corrupt than a single town's leadership. But the Council also has internal politics, and one of its seven towns has quietly been negotiating with an armed faction for military protection in exchange for trade monopoly rights.",
      },
      {
        name: "The Stillwater Basin",
        trigger: "stillwater, basin, dead zone, chemical, east, marker, vault",
        type: "location",
        content:
          "A forty-square-mile depression in the Midland's eastern reach where nothing grows and the ground has a faint chemical smell that travelers who've been close enough to report describe as something between acetone and rot. The Collapse's cascade failure included a chemical processing facility on the basin's northern edge that released a soil-persistent compound when its containment systems lost power. The compound is not acutely lethal in brief exposure but accumulates in living tissue and causes organ failure over weeks. Full traversal of the basin requires filtration equipment (respirator-grade, activated charcoal, sealed eye protection) that can be sourced from a medical supply cache Ines Veracruz hid near the basin's western approach. At the basin's center, disguised as a collapsed utility shed, is the data vault: a hardened server array powered by a buried geothermal tap, containing full pre-Collapse infrastructure restoration models and Dr. Veracruz's twelve years of post-Collapse annotation.",
        notes:
          "The data vault is accessible but not easily. The geothermal tap keeps the servers running but the access terminal requires a key-code sequence found in Ines's letter. The vault's contents are both the solution and a new problem: releasing the full information immediately, to everyone, may cause more instability than a managed disclosure.",
      },
    ],
  },
};
