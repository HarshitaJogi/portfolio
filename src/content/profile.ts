/**
 * Every word and number on the site lives here.
 * Edit copy in this file only. Components read from it and never hardcode content.
 *
 * Truth rules (from the brief): no invented metrics, no banned skills, Nokia stays
 * at the level written below. `pnpm truth` checks this file and the built HTML.
 */

/* ------------------------------------------------------------------ */
/* Site config                                                         */
/* ------------------------------------------------------------------ */

/**
 * The one domain value. Set NEXT_PUBLIC_SITE_URL in Vercel when the domain is final.
 * TODO(Harshita): confirm harshitajogi.com vs harshitajogi.dev.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://harshitajogi.com").replace(/\/$/, "");

/** Where swappable photos live. Replace files in place, same names. See README. */
export const MEDIA_DIR = "/placeholders";

export const media = {
  headshot: { src: `${MEDIA_DIR}/headshot.jpg`, alt: "Portrait of Harshita Jogi", width: 1197, height: 1800 },
  dance: [1, 2, 3, 4, 5].map((n) => ({
    src: `${MEDIA_DIR}/dance-${n}.jpg`,
    alt: "Bharatanatyam performance",
  })),
  bitgig: { src: `${MEDIA_DIR}/bitgig.jpg`, alt: "Bitgig landing page: Gemini drafts, experts decide", width: 1440, height: 900 },
  drone: { src: `${MEDIA_DIR}/drone.jpg`, alt: "Aerial view of crop fields" },
  resumePdf: "/Harshita_Jogi_Resume.pdf",
} as const;

/* ------------------------------------------------------------------ */
/* Identity                                                            */
/* ------------------------------------------------------------------ */

export const person = {
  name: "Harshita Jogi",
  firstName: "Harshita",
  role: "Software Engineer",
  focus: "AI and data systems",
  location: "Sunnyvale, CA",
  email: "harshitajogi2001@gmail.com",
  links: {
    linkedin: "https://www.linkedin.com/in/harshita-jogi-563227215/",
    github: "https://github.com/HarshitaJogi",
    /** TODO(Harshita): set the real repo URL once this site is pushed. */
    source: "https://github.com/HarshitaJogi/portfolio",
  },
  availability: "Open to full-time roles starting 2027",
  graduation: "May 2027",
} as const;

export const hero = {
  kicker: "Software engineer / AI and data systems",
  /**
   * The headline acts out the dashed-to-solid rule.
   * `draft` segments render as dashed construction outlines.
   * `resolve` segments start dashed and settle into solid ink.
   */
  headline: [
    { text: "AI writes the " },
    { text: "first draft", mode: "draft" },
    { text: ". I make it " },
    { text: "right", mode: "resolve" },
    { text: "." },
  ] as { text: string; mode?: "draft" | "resolve" }[],
  subline: "Software engineer building LLM agents, data pipelines, and the checks that make them trustworthy.",
  now: [
    { label: "Now", text: "Software Engineer Co-op at Nokia, Sunnyvale" },
    { label: "Study", text: "MS in Computer Science at Northeastern, graduating May 2027" },
  ],
  photoHint: { fine: "Hover for off-stage", coarse: "Tap for off-stage" },
};

/* ------------------------------------------------------------------ */
/* Tracks (?track=ai|data|swe|systems)                                 */
/* ------------------------------------------------------------------ */

export const TRACKS = ["ai", "data", "swe", "systems"] as const;
export type Track = (typeof TRACKS)[number];
export type TrackOrDefault = Track | "default";

/* ------------------------------------------------------------------ */
/* Proof                                                               */
/* ------------------------------------------------------------------ */

export type Stat = {
  id: string;
  /** Final value, counted up to. */
  value: number;
  prefix?: string;
  suffix?: string;
  /** Thousands separator, e.g. 25,000. */
  separator?: string;
  /** Optional "before" value shown as a dashed draft, e.g. 60% → 98%. */
  before?: string;
  /** Count-up start. Defaults to 0. */
  from?: number;
  caption: string;
  source: string;
  href: string;
};

export const proof = {
  title: "Proof",
  intro: "Six numbers, each tied to the work behind it.",
  stats: [
    {
      id: "accuracy",
      before: "60%",
      from: 60,
      value: 98,
      suffix: "%",
      caption: "LLM annotation accuracy, after studying every false positive and false negative against ground truth.",
      source: "Network Science Institute",
      href: "#role-nsi",
    },
    {
      id: "papers",
      value: 1,
      suffix: "M+",
      caption: "Biomedical research papers in the GPT-4.1 annotation pipeline I created.",
      source: "Network Science Institute",
      href: "#role-nsi",
    },
    {
      id: "cost",
      value: 40,
      suffix: "%",
      caption: "Lower infrastructure cost after migrating 15+ APIs from Azure to GCP.",
      source: "MSCI",
      href: "#role-msci",
    },
    {
      id: "data",
      value: 5,
      suffix: "TB",
      caption: "Data moved from OracleDB to BigQuery through Databricks ETL pipelines.",
      source: "MSCI",
      href: "#role-msci",
    },
    {
      id: "f1",
      value: 97,
      suffix: "% F1",
      caption: "SciBERT fine-tuned to extract research tools from biomedical text.",
      source: "Network Science Institute",
      href: "#role-nsi",
    },
    {
      id: "grant",
      value: 25000,
      prefix: "$",
      separator: ",",
      caption: "IEEE AESS research grant for the drone project I led.",
      source: "IEEE AESS DSTEI",
      href: "#project-drone",
    },
  ] satisfies Stat[],
  order: {
    default: ["accuracy", "papers", "cost", "data", "f1", "grant"],
    ai: ["accuracy", "f1", "papers", "grant", "cost", "data"],
    data: ["data", "papers", "accuracy", "cost", "f1", "grant"],
    swe: ["cost", "accuracy", "data", "papers", "f1", "grant"],
    systems: ["cost", "data", "accuracy", "papers", "f1", "grant"],
  } satisfies Record<TrackOrDefault, string[]>,
};

/* ------------------------------------------------------------------ */
/* Story                                                               */
/* ------------------------------------------------------------------ */

export const story = {
  kicker: "How I work",
  paragraph:
    "I started in electronics, building a drone that could spot crop disease from fifteen meters up. Then I moved into software at MSCI, taking production APIs and terabytes of financial data to the cloud. At Northeastern I used LLMs to annotate over a million research papers, and learned that accuracy comes from studying every mistake. Now at Nokia I build LLM agents that do real engineering work, and the checks that make them safe to trust.",
  principle: ["Build.", "Verify.", "Ship."],
  principleNote: "Every role below follows that order.",
};

/* ------------------------------------------------------------------ */
/* Work (reverse chronological)                                        */
/* ------------------------------------------------------------------ */

export type Role = {
  id: string;
  company: string;
  companyLong?: string;
  note?: { text: string; href: string };
  title: string;
  location: string;
  start: string;
  end: string;
  framing: string;
  bullets: string[];
  stack?: string[];
};

export const work: { title: string; roles: Role[] } = {
  title: "Work",
  roles: [
    {
      id: "nokia",
      company: "Nokia",
      title: "Software Engineer Co-op, Test Automation & AI Tooling",
      location: "Sunnyvale, CA",
      start: "May 2026",
      end: "Present",
      framing: "Building AI that does real engineering work, and the guardrails that make it trustworthy.",
      bullets: [
        "Extended a 50K+ line Python test framework, porting routing protocol test suites to a new router platform on live hardware.",
        "Built an LLM agent to automate test porting, grounded via internal-doc tool calls and a failure checklist mined from past debugging.",
        "Redesigned the agent into staged, dependency-ordered runs after live evaluation, adding false-pass checks and human review gates.",
      ],
    },
    {
      id: "nsi",
      company: "Network Science Institute",
      companyLong: "Northeastern University",
      note: {
        text: "NIH-funded BioToolKB project",
        href: "https://reporter.nih.gov/search/kCp_sb-NWku7rIPfBMI6Xg/project-details/11190944",
      },
      title: "Research Assistant",
      location: "Boston, MA",
      start: "Jul 2025",
      end: "Jul 2026",
      framing: "Accuracy came from studying every mistake.",
      bullets: [
        "Created a Python pipeline that uses GPT-4.1 to automate annotation of 1M+ biomedical research papers.",
        "Raised annotation accuracy from 60% to 98% via prompt iteration driven by false-positive and false-negative analysis against ground truth.",
        "Reduced GPT-4.1 token usage with structured output schemas and parsing logic, without sacrificing accuracy.",
        "Fine-tuned SciBERT for biomedical named entity recognition (NER), reaching 97% F1 on research-tool extraction.",
      ],
    },
    {
      id: "msci",
      company: "MSCI",
      companyLong: "Morgan Stanley Capital International",
      title: "Technology Analyst",
      location: "Mumbai, India",
      start: "Jan 2024",
      end: "Aug 2025",
      framing: "Moving production systems across clouds, with tests and security scans guarding every release.",
      bullets: [
        "Migrated 15+ APIs from Azure to GCP via Kubernetes and Docker, cutting latency by 23% and infrastructure costs by 40%.",
        "Engineered Spring Boot REST APIs for client-facing services, achieving 82% test coverage via JUnit and Gatling.",
        "Developed Databricks ETL pipelines using PySpark and Pandas, moving 5TB of data from OracleDB to BigQuery.",
        "Automated CI/CD release pipelines with SonarQube scanning, remediating security vulnerabilities before production.",
      ],
      stack: ["Azure", "GCP", "Kubernetes", "Docker", "Spring Boot", "Databricks", "BigQuery", "SonarQube"],
    },
    {
      id: "iitp",
      company: "IIT Patna",
      companyLong: "Indian Institute of Technology Patna",
      title: "Research Intern",
      location: "Remote",
      start: "Jul 2023",
      end: "Sep 2023",
      framing: "Where the research thread started. Better detection, small enough to run at the edge.",
      bullets: [
        "Enhanced a YOLOv9 model with a modified architecture for better feature extraction on agricultural imagery.",
        "Reached 86% detection accuracy using multi-scale feature fusion and optimized loss functions.",
        "Applied model quantization for edge deployment on NVIDIA Jetson.",
      ],
    },
  ],
};

/** Nokia agent walkthrough. Described at the level of the brief, nothing more. */
export const nokiaAgent = {
  title: "How the agent is designed",
  disclaimer: "Described at a high level. The details belong to Nokia.",
  steps: [
    {
      name: "Ground",
      title: "Read the docs first",
      body: "The agent looks up internal documentation through tool calls, so its work is grounded in real references.",
      chip: { name: "tool call", argument: "documentation" },
    },
    {
      name: "Recall",
      title: "Learn from past failures",
      body: "It also works from a failure checklist mined from past debugging, so it starts from what has gone wrong before.",
    },
    {
      name: "Stage",
      title: "Run in dependency order",
      body: "After live evaluation, I redesigned it into staged runs ordered by dependency, so each step builds on work that already holds.",
    },
    {
      name: "Verify",
      title: "Catch false passes",
      body: "A test that passes for the wrong reason is worse than one that fails. False-pass checks look for exactly that.",
    },
    {
      name: "Review",
      title: "A person signs off",
      body: "Human review gates sit at the end. The agent drafts. An engineer decides.",
    },
  ],
};

/** NSI before/after. 50 marks, each mark is 2% of annotations. */
export const nsiAccuracy = {
  before: { label: "First prompt", value: 60 },
  after: { label: "After error analysis", value: 98 },
  marks: 50,
  caption: "Illustration. Each mark stands for 2% of annotations.",
};

export const msciMigration = {
  from: "Azure",
  to: "GCP",
  apis: 15,
  apisLabel: "15+ APIs",
  via: "Kubernetes and Docker",
  results: [
    { value: "23%", label: "lower latency" },
    { value: "40%", label: "lower infrastructure cost" },
  ],
};

/* ------------------------------------------------------------------ */
/* Education                                                           */
/* ------------------------------------------------------------------ */

export const education = {
  title: "Education",
  schools: [
    {
      id: "neu",
      school: "Northeastern University",
      location: "Boston, MA",
      degree: "Master of Science in Computer Science",
      start: "Sep 2025",
      end: "May 2027",
      gpa: "GPA 3.9/4.0",
      details: ["Algorithms", "Artificial Intelligence", "Database Management", "Object-Oriented Design", "Distributed Systems"],
      awards: ["Academic Excellence Scholarship", "International Impact Award"],
    },
    {
      id: "mu",
      school: "University of Mumbai",
      location: "Mumbai, India",
      degree: "Bachelor of Engineering in Electronics",
      start: "Aug 2020",
      end: "May 2024",
      gpa: "GPA 9.04/10",
      details: [],
      awards: [],
    },
  ],
};

/* ------------------------------------------------------------------ */
/* Projects (reverse chronological)                                    */
/* ------------------------------------------------------------------ */

export const bitgig = {
  id: "bitgig",
  name: "Bitgig",
  event: "Berkeley × DeepMind Hackathon",
  date: "Sep 2026",
  tagline: "Expert annotation for lab and medical video. AI drafts, verified experts correct.",
  live: "https://bitgig-smoky.vercel.app/",
  /** TODO(Harshita): repo URL, or leave null for no link. */
  repo: null as string | null,
  /** TODO(Harshita): teammates. When set, rendered as a credit line. */
  team: null as string | null,
  stages: [
    { name: "Upload", text: "Video and SOP come in" },
    { name: "Draft", text: "Gemini pre-segments the video into SOP steps" },
    { name: "Correct", text: "Verified experts correct the drafts" },
    { name: "Agree", text: "Consensus QC flags and resolves disagreements" },
    { name: "Verified", text: "Verified labels become training data" },
  ],
  legend: { draft: "Dashed: draft", verified: "Solid: verified" },
  bullets: [
    "Architected a human-in-the-loop video data pipeline on Cloud Run and Cloud Storage, keeping datasets in-network with Gemini.",
    "Integrated the Gemini API to pre-segment lab and medical video into SOP steps, so experts correct drafts, not raw footage.",
    "Implemented consensus QC across expert reviews, routing disagreements to resolution before labels become training data.",
    "Shipped the expert-review interface in Next.js, React, and TypeScript on Vercel, from video and SOP upload to verified labels.",
  ],
  stack: ["Gemini API", "Cloud Run", "Cloud Storage", "Next.js", "React", "TypeScript", "Vercel"],
};

export const publications = [
  {
    id: "yolov9",
    short: "Maize leaf blight detection with modified YOLOv9",
    title: "Enhanced Detection of Maize Leaf Blight in Dynamic Field Conditions Using Modified YOLOv9",
    authors: "K. Gharat, H. Jogi, K. Gode, K. Talele, S. Kulkarni, and M. H. Kolekar",
    venue: "2024 IEEE Space, Aerospace and Defence Conference (SPACE)",
    pages: "pp. 140–143",
    year: "2024",
    href: "https://ieeexplore.ieee.org/document/10668319",
  },
  {
    id: "uav",
    short: "Multi-stage drone system for crop health",
    title: "Multi-Stage UAV-Based System for Scalable and Accurate Crop Health Monitoring",
    authors: "K. Gode, K. Gharat, H. Jogi, A. Sapkal, R. Thakar, S. Vishwakarma, K. Talele, and S. Kulkarni",
    venue: "2024 IEEE Space, Aerospace and Defence Conference (SPACE)",
    pages: "pp. 652–655",
    year: "2024",
    href: "https://ieeexplore.ieee.org/document/10667804",
  },
];

export const patent = {
  status: "Patent filed",
  title: "Automated Crop Health Monitoring System Using Unmanned Aerial Vehicle",
};

export const drone = {
  id: "drone",
  name: "Drone-Based Precision Agriculture",
  fullName: "Autonomous Drone-Based Precision Agriculture System",
  funding: "IEEE AESS DSTEI funded research",
  grant: "$25,000",
  role: "Research Lead",
  start: "Jul 2023",
  end: "Dec 2023",
  tagline: "A drone that classifies crop leaves in real time from 15m up.",
  bullets: [
    "Built a TensorFlow pipeline using NDVI for region-of-interest detection, enabling accurate geospatial crop mapping.",
    "Deployed a quantized CNN on an NVIDIA Jetson-mounted drone, achieving real-time leaf classification at 15m altitude.",
    "Published 2 IEEE SPACE papers and filed a patent.",
  ],
  researchLabel: "Research",
};

export const scheduler = {
  id: "scheduler",
  name: "Event Scheduling & Management System",
  meta: "Java · Coursework",
  start: "Nov 2025",
  end: "Dec 2025",
  patterns: ["MVC", "Command", "Strategy", "Factory"],
  bullets: [
    "Built an MVC calendar engine with the Command pattern, supporting 18+ operations via regex-based parsing.",
    "Developed a multi-calendar system with timezone conversion, recurring events, and conflict detection.",
    "Designed a pluggable export module using Strategy and Factory patterns for CSV and iCal formats.",
  ],
};

export const hackathons = {
  title: "Hackathons",
  tickets: [
    {
      id: "berkeley",
      event: "Berkeley × DeepMind Hackathon",
      date: "Sep 2026",
      project: "Bitgig",
      line: "Expert annotation for lab and medical video",
      stub: "Admit one",
      stamp: "Shipped",
      href: "https://bitgig-smoky.vercel.app/",
    },
    {
      id: "harvard",
      event: "Harvard Hack-o-Ween",
      date: "Oct 2025",
      project: "TryBud",
      line: "Blockchain job-verification platform",
      stub: "2nd place",
      stamp: "$3,600 prize",
      /** TODO(Harshita): TryBud repo URL, or leave null for no link. */
      href: null as string | null,
    },
  ],
};

export type ProjectId = "bitgig" | "drone" | "scheduler" | "hackathons";
export const projectOrder: Record<TrackOrDefault, ProjectId[]> = {
  default: ["bitgig", "drone", "scheduler", "hackathons"],
  ai: ["bitgig", "drone", "hackathons", "scheduler"],
  data: ["bitgig", "drone", "scheduler", "hackathons"],
  swe: ["bitgig", "scheduler", "drone", "hackathons"],
  systems: ["bitgig", "scheduler", "drone", "hackathons"],
};

/* ------------------------------------------------------------------ */
/* Toolkit                                                             */
/* ------------------------------------------------------------------ */

export const toolkit = {
  title: "Toolkit",
  intro: "The front says what. The back says where I used it.",
  flipHint: "Flip",
  cards: [
    {
      id: "llm",
      title: "LLM systems",
      skills: ["LLM agents", "Model Context Protocol", "Prompt engineering", "LLM evaluation", "GPT-4.1", "Gemini API", "Cursor"],
      used: [
        { where: "Nokia", what: "LLM agent with MCP tool integration, redesigned after live evaluation, developed in Cursor" },
        { where: "NSI", what: "GPT-4.1 pipeline, prompts iterated against ground truth" },
        { where: "Bitgig", what: "Gemini API drafts SOP steps from video" },
      ],
    },
    {
      id: "ml",
      title: "Machine learning",
      skills: ["SciBERT", "NER", "TensorFlow", "YOLOv9", "Model quantization", "NVIDIA Jetson", "Prodigy"],
      used: [
        { where: "NSI", what: "SciBERT NER at 97% F1, Prodigy in the annotation pipeline" },
        { where: "IIT Patna", what: "Modified YOLOv9, quantized for Jetson" },
        { where: "Drone", what: "TensorFlow NDVI pipeline, quantized CNN on a Jetson" },
      ],
    },
    {
      id: "data",
      title: "Data",
      skills: ["Databricks", "PySpark", "Pandas", "BigQuery", "OracleDB", "ETL", "Data modeling"],
      used: [{ where: "MSCI", what: "Databricks ETL in PySpark and Pandas, data modeling for the pipelines, 5TB from OracleDB to BigQuery" }],
    },
    {
      id: "backend",
      title: "Backend",
      skills: ["Spring Boot", "REST APIs", "JUnit", "Gatling"],
      used: [{ where: "MSCI", what: "Spring Boot REST APIs for client-facing services, 82% coverage with JUnit and Gatling" }],
    },
    {
      id: "cloud",
      title: "Cloud & DevOps",
      skills: ["GCP", "Cloud Run", "Cloud Storage", "Azure", "Docker", "Kubernetes", "CI/CD", "SonarQube", "Vercel"],
      used: [
        { where: "MSCI", what: "15+ APIs from Azure to GCP on Kubernetes and Docker, CI/CD with SonarQube" },
        { where: "Bitgig", what: "Cloud Run, Cloud Storage, Vercel" },
      ],
    },
    {
      id: "lang",
      title: "Languages & web",
      skills: ["Python", "Java", "TypeScript", "React", "Next.js"],
      used: [
        { where: "Nokia", what: "Python, a 50K+ line test framework" },
        { where: "MSCI", what: "Java and Spring Boot" },
        { where: "Coursework", what: "Java, MVC calendar engine" },
        { where: "Bitgig", what: "Next.js, React, TypeScript" },
      ],
    },
  ],
  /** Skills without a confirmed "where". Shown as plain text, never on a card. */
  alsoFamiliar: ["C++", "SQL", "JavaScript", "PostgreSQL", "AWS", "Git"],
  alsoLabel: "Also familiar with",
};

/* ------------------------------------------------------------------ */
/* Off-stage and the margam                                            */
/* ------------------------------------------------------------------ */

export const offstage = {
  title: "Off-stage",
  paragraphs: [
    "I am a trained Bharatanatyam dancer, with a Kovida degree from Nalanda Dance Research Center. Dance taught me that the hard work stays invisible. What reaches people feels effortless. I try to build software the same way.",
    "I also care about saying things clearly. I hold Trinity College London's Communication Skills Grade 5, with Distinction.",
  ],
  credentials: [
    { label: "Kovida degree in Bharatanatyam", org: "Nalanda Dance Research Center" },
    { label: "Communication Skills Grade 5, Distinction", org: "Trinity College London" },
  ],
  quote: "The hard work stays invisible. What reaches people feels effortless.",
  revealLead: "If you scrolled this far,",
  revealLine: "you just watched a margam.",
  revealSub: "A Bharatanatyam recital follows a fixed order, from invocation to blessing. This page does too.",
  mapHint: "Each point is one part of the recital. Select one to go back to it.",
};

export const margam = [
  { id: "alarippu", name: "Alarippu", meaning: "The invocation. A short opening that greets the audience.", section: "Introduction", href: "#top" },
  { id: "jatiswaram", name: "Jatiswaram", meaning: "Pure technique. Rhythm and footwork, no words.", section: "Proof", href: "#proof" },
  { id: "shabdam", name: "Shabdam", meaning: "Movement joined to words, telling a story.", section: "How I work", href: "#story" },
  { id: "varnam", name: "Varnam", meaning: "The centerpiece. The longest, most demanding piece.", section: "Work and projects", href: "#work" },
  { id: "padam", name: "Padam", meaning: "Slow and expressive. The most personal part.", section: "Off-stage", href: "#offstage" },
  { id: "tillana", name: "Tillana", meaning: "A brisk, joyful finale.", section: "Contact", href: "#contact" },
  { id: "mangalam", name: "Mangalam", meaning: "The closing blessing.", section: "Footer", href: "#footer" },
] as const;

/* ------------------------------------------------------------------ */
/* Contact, footer, misc                                               */
/* ------------------------------------------------------------------ */

export const contact = {
  title: "Say hello.",
  line: "I am looking for full-time roles starting in 2027. If your team builds AI or data systems that have to hold up, I would like to hear from you.",
  copy: "Copy email",
  copied: "Copied",
};

export const footer = {
  builtWith: "Designed and built by Harshita in Next.js and TypeScript.",
  source: "Source on GitHub",
  updated: "Last updated",
};

export const notFound = {
  title: "This page stepped off stage.",
  back: "Back to the performance",
};

export const consoleNote = [
  "Hi. You opened the console, so you are my kind of person.",
  `This site is open source: ${person.links.source}`,
  `If something looks broken, tell me: ${person.email}`,
  "Harshita",
];

/** Section index (desktop rail, mobile menu, command palette). */
export const sections = [
  { id: "top", label: "Introduction", margam: "Alarippu" },
  { id: "proof", label: "Proof", margam: "Jatiswaram" },
  { id: "story", label: "How I work", margam: "Shabdam" },
  { id: "work", label: "Work", margam: "Varnam" },
  { id: "education", label: "Education", margam: "Varnam" },
  { id: "projects", label: "Projects", margam: "Varnam" },
  { id: "toolkit", label: "Toolkit", margam: "Varnam" },
  { id: "offstage", label: "Off-stage", margam: "Padam" },
  { id: "contact", label: "Contact", margam: "Tillana" },
] as const;

export const seo = {
  title: "Harshita Jogi, Software Engineer",
  description:
    "Harshita Jogi is a software engineer building LLM agents, data pipelines, and the checks that make them trustworthy. MS CS at Northeastern, co-op at Nokia. Open to full-time roles starting 2027.",
};
