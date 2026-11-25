import type { Opportunity } from "@/lib/types";

/**
 * Insight programmes, early-career schemes and conferences worth knowing
 * about, curated by hand because no API lists them.
 *
 * Every URL here was checked and returned 200; `npm run check:links` keeps
 * them honest. What is deliberately absent is dates. Application windows move
 * every year and a wrong deadline in a tracker is worse than no deadline -
 * it is the kind of mistake that makes someone miss the real one. So each
 * entry carries the link and what the thing is, and you record the deadline
 * yourself once you have read it from the page. The countdown is then real.
 */
export const opportunities: Opportunity[] = [
  /* ----------------------------------------- insight and early programmes */
  {
    id: "google-step",
    name: "Google STEP",
    organisation: "Google",
    kind: "early-programme",
    openTo: "First and second years",
    summary:
      "A paid summer internship built for students early in a degree, with mentoring and a cohort. One of the few big-tech programmes that explicitly wants people before their penultimate year.",
    url: "https://buildyourfuture.withgoogle.com/programs/step",
  },
  {
    id: "microsoft-internships",
    name: "Microsoft internships",
    organisation: "Microsoft",
    kind: "early-programme",
    openTo: "Undergraduates",
    summary:
      "Microsoft's student hiring hub, including its explore-style programmes for people early in a degree.",
    url: "https://careers.microsoft.com/v2/global/en/internships",
  },
  {
    id: "meta-student",
    name: "Meta student programmes",
    organisation: "Meta",
    kind: "early-programme",
    openTo: "Undergraduates",
    summary:
      "Meta's student hub, covering its university programmes and internships.",
    url: "https://www.metacareers.com/careerprograms/students",
  },
  {
    id: "amazon-student",
    name: "Amazon student programmes",
    organisation: "Amazon",
    kind: "early-programme",
    openTo: "Undergraduates",
    summary:
      "Amazon's student programme hub. Worth watching because it posts in waves rather than once.",
    url: "https://www.amazon.jobs/content/en/career-programs/student-programs",
  },
  {
    id: "palantir-students",
    name: "Palantir student roles",
    organisation: "Palantir",
    kind: "early-programme",
    openTo: "Undergraduates",
    summary:
      "Palantir's student hub, including its path and fellowship programmes.",
    url: "https://www.palantir.com/careers/students/",
  },
  {
    id: "jpmorgan-code-for-good",
    name: "Code for Good",
    organisation: "J.P. Morgan",
    kind: "insight-day",
    openTo: "Undergraduates, no finance background needed",
    summary:
      "A weekend hackathon building something for a charity. A well-known route into a J.P. Morgan technology internship, and it takes people with no finance experience.",
    url: "https://careers.jpmorgan.com/global/en/students/programs/code-for-good",
  },
  {
    id: "goldman-students",
    name: "Goldman Sachs student programmes",
    organisation: "Goldman Sachs",
    kind: "insight-day",
    openTo: "Undergraduates",
    summary:
      "Goldman's student hub, including its insight series for people earlier in a degree than the main internship.",
    url: "https://www.goldmansachs.com/careers/students/programs",
  },

  /* -------------------------------------------------------------- quant */
  {
    id: "jane-street-insight",
    name: "INSIGHT",
    organisation: "Jane Street",
    kind: "insight-day",
    openTo: "Students from under-represented groups in tech and finance",
    summary:
      "A few days at Jane Street learning what the firm actually does, with no prior finance knowledge assumed. Often a route into their internship.",
    url: "https://www.janestreet.com/join-jane-street/programs-and-events/insight/",
  },
  {
    id: "jane-street-focus",
    name: "FOCUS",
    organisation: "Jane Street",
    kind: "insight-day",
    openTo: "First years",
    summary:
      "Jane Street's programme aimed specifically at first-year students — one of the earliest points of entry into quant anywhere.",
    url: "https://www.janestreet.com/join-jane-street/programs-and-events/focus/",
  },
  {
    id: "deshaw-students",
    name: "D. E. Shaw student programmes",
    organisation: "D. E. Shaw",
    kind: "early-programme",
    openTo: "Undergraduates",
    summary:
      "Student hub for one of the oldest quantitative firms, including its discovery-style early programmes.",
    url: "https://www.deshaw.com/careers/students",
  },
  {
    id: "optiver-early",
    name: "Optiver early careers",
    organisation: "Optiver",
    kind: "early-programme",
    openTo: "Undergraduates",
    summary:
      "Market-making firm with internships in trading, research and engineering. Their process leans heavily on mental maths and probability games.",
    url: "https://www.optiver.com/working-at-optiver/early-careers/",
  },
  {
    id: "sig-careers",
    name: "SIG campus programmes",
    organisation: "Susquehanna",
    kind: "early-programme",
    openTo: "Undergraduates",
    summary:
      "SIG runs trading, quant and technology internships, and is known for teaching poker and game theory as part of the process.",
    url: "https://careers.sig.com",
  },
  {
    id: "imc-careers",
    name: "IMC early careers",
    organisation: "IMC Trading",
    kind: "early-programme",
    openTo: "Undergraduates",
    summary:
      "Market maker with internships across trading, software engineering and hardware.",
    url: "https://careers.imc.com",
  },
  {
    id: "jump-trading",
    name: "Jump Trading careers",
    organisation: "Jump Trading",
    kind: "early-programme",
    openTo: "Undergraduates",
    summary:
      "Low-latency trading firm. Their engineering side is the closest commercial work to the order book in this app.",
    url: "https://www.jumptrading.com/careers/",
  },
  {
    id: "bridgewater-students",
    name: "Bridgewater student programmes",
    organisation: "Bridgewater Associates",
    kind: "early-programme",
    openTo: "Undergraduates",
    summary:
      "Investment manager with investment-engineer and software internships.",
    url: "https://www.bridgewater.com/working-at-bridgewater/students",
  },

  /* -------------------------------------------------------- conferences */
  {
    id: "grace-hopper",
    name: "Grace Hopper Celebration",
    organisation: "AnitaB.org",
    kind: "conference",
    openTo: "Women and non-binary technologists; scholarships available",
    summary:
      "The largest gathering of women in computing, with a career fair where companies interview on the spot. Scholarships cover registration and travel for students.",
    url: "https://ghc.anitab.org",
  },
  {
    id: "nsbe",
    name: "NSBE Annual Convention",
    organisation: "National Society of Black Engineers",
    kind: "conference",
    openTo: "Members; student scholarships available",
    summary:
      "A large engineering convention with a career fair where companies hire directly. Chapters often fund member travel.",
    url: "https://www.nsbe.org",
  },
  {
    id: "afrotech",
    name: "AFROTECH Conference",
    organisation: "AFROTECH",
    kind: "conference",
    openTo: "Open; some sponsored student passes",
    summary:
      "A Black tech conference with a substantial recruiting presence. Companies sponsor student passes most years.",
    url: "https://afrotech.com",
  },
  {
    id: "neurips",
    name: "NeurIPS",
    organisation: "NeurIPS Foundation",
    kind: "conference",
    openTo: "Open; travel grants for students",
    summary:
      "The main machine-learning research conference. Worth it if you are heading towards AI research; registration and travel grants exist for students.",
    url: "https://neurips.cc",
  },
  {
    id: "usenix",
    name: "USENIX conferences",
    organisation: "USENIX",
    kind: "conference",
    openTo: "Open; student grants available",
    summary:
      "Systems and security conferences — OSDI, NSDI, USENIX Security, SREcon. Student grants cover registration and travel.",
    url: "https://www.usenix.org/conferences",
  },
];

export const opportunityById = new Map(opportunities.map((o) => [o.id, o]));
