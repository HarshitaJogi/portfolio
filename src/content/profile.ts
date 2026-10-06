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
  /** v2 hero meta row: short, scannable. */
  meta: [
    { label: "Now", text: "SWE Co-op, Nokia" },
    { label: "MS CS", text: "Northeastern, May 2027" },
    { label: "Based", text: "Sunnyvale, CA" },
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
/* Work (reverse chronological)                                        */
/* ------------------------------------------------------------------ */

export type Role = {
  id: string;
  /** v2: one scannable line, and the proof as chips. Bullets stay for the expanded view and /resume. */
  oneLiner: string;
  chips: string[];
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
      oneLiner: "LLM agents that port test suites, with the guardrails that make them trustworthy.",
      chips: ["LLM agents", "50K+ line Python framework", "Human review gates"],
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
      oneLiner: "A GPT-4.1 pipeline that annotates 1M+ biomedical papers.",
      chips: ["60% → 98% accuracy", "97% F1 SciBERT NER", "NIH-funded"],
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
      oneLiner: "Moved production APIs and data across clouds, guarded by tests and scans.",
      chips: ["15+ APIs Azure → GCP", "23% lower latency", "40% lower infra cost", "5TB to BigQuery"],
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
      oneLiner: "Better crop-disease detection, small enough to run at the edge.",
      chips: ["Modified YOLOv9", "86% detection accuracy", "NVIDIA Jetson"],
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


export const margam = [
  { id: "alarippu", name: "Alarippu", meaning: "The invocation. A short opening that greets the audience.", section: "Introduction", href: "#top" },
  { id: "jatiswaram", name: "Jatiswaram", meaning: "Pure technique. Rhythm and footwork, no words.", section: "The numbers", href: "#metrics" },
  { id: "shabdam", name: "Shabdam", meaning: "Movement joined to words, telling a story.", section: "Experience", href: "#work" },
  { id: "varnam", name: "Varnam", meaning: "The centerpiece. The longest, most demanding piece.", section: "Projects and stack", href: "#projects" },
  { id: "padam", name: "Padam", meaning: "Slow and expressive. The most personal part.", section: "Off the clock", href: "#offstage" },
  { id: "tillana", name: "Tillana", meaning: "A brisk, joyful finale.", section: "Contact", href: "#contact" },
  { id: "mangalam", name: "Mangalam", meaning: "The closing blessing.", section: "Footer", href: "#footer" },
] as const;

/* ------------------------------------------------------------------ */
/* Contact, footer, misc                                               */
/* ------------------------------------------------------------------ */

export const contact = {
  title: "Let's make it right.",
  line: "I am looking for full-time roles starting in 2027. If your team builds AI or data systems that have to hold up, I would like to hear from you.",
  copy: "Copy email",
  copied: "Copied",
  short: "Open to full-time roles starting 2027. Software, AI, and data teams.",
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
  { id: "welcome", label: "The island", href: "/" },
  { id: "education", label: "Education", href: "/education" },
  { id: "skills", label: "Skills", href: "/skills" },
  { id: "experience", label: "Experience", href: "/experience" },
  { id: "nokia", label: "Nokia", href: "/experience#nokia" },
  { id: "nsi", label: "Network Science Institute", href: "/experience#nsi" },
  { id: "msci", label: "MSCI", href: "/experience#msci" },
  { id: "projects", label: "Projects & research", href: "/projects" },
  { id: "bitgig", label: "Bitgig", href: "/projects#bitgig" },
  { id: "offstage", label: "Off-stage", href: "/offstage" },
  { id: "contact", label: "Contact", href: "/#contact" },
] as const;

export const seo = {
  title: "Harshita Jogi, Software Engineer",
  description:
    "Harshita Jogi is a software engineer building LLM agents, data pipelines, and the checks that make them trustworthy. MS CS at Northeastern, co-op at Nokia. Open to full-time roles starting 2027.",
};

/* ------------------------------------------------------------------ */
/* v2: hero agent console, metrics bar, stack, short off-stage          */
/* ------------------------------------------------------------------ */

/**
 * The hero console. The shape of the Nokia agent, simplified to the level of the brief.
 * The visitor is the human review gate.
 */
export const agentConsole = {
  title: "port-test-suite.agent",
  caption: "The shape of my Nokia agent, simplified.",
  steps: [
    { id: "ground", label: "Ground", detail: "tool call: internal docs" },
    { id: "recall", label: "Recall", detail: "failure checklist" },
    { id: "stage", label: "Stage", detail: "dependency-ordered runs" },
    { id: "verify", label: "Verify", detail: "false-pass checks" },
  ],
  gate: {
    label: "Review",
    waiting: "waiting for a human",
    hold: "Hold to approve",
    done: "Approved",
    verified: "Verified. You were the human in the loop.",
    replay: "Run again",
  },
  status: { running: "running", waiting: "needs review", done: "verified" },
};

export type Metric = { id: string; value: string; label: string; tip: string; source: string; href: string; from?: string };
export const metrics: Metric[] = [
  { id: "accuracy", value: "98%", from: "60%", label: "annotation accuracy", tip: "Up from 60% by analysing every false positive and false negative against ground truth.", source: "NSI", href: "#role-nsi" },
  { id: "papers", value: "1M+", label: "papers annotated", tip: "GPT-4.1 pipeline over biomedical research papers for an NIH-funded project.", source: "NSI", href: "#role-nsi" },
  { id: "f1", value: "97%", label: "F1, SciBERT NER", tip: "Fine-tuned SciBERT to extract research tools from biomedical text.", source: "NSI", href: "#role-nsi" },
  { id: "cost", value: "40%", label: "lower infra cost", tip: "After migrating 15+ APIs from Azure to GCP on Kubernetes and Docker.", source: "MSCI", href: "#role-msci" },
  { id: "data", value: "5TB", label: "data migrated", tip: "OracleDB to BigQuery through Databricks ETL pipelines.", source: "MSCI", href: "#role-msci" },
  { id: "grant", value: "$25,000", label: "research grant", tip: "IEEE AESS DSTEI funding for the drone research I led.", source: "IEEE", href: "#project-drone" },
];
export const metricOrder: Record<TrackOrDefault, string[]> = {
  default: ["accuracy", "papers", "f1", "cost", "data", "grant"],
  ai: ["accuracy", "f1", "papers", "grant", "cost", "data"],
  data: ["data", "papers", "accuracy", "cost", "f1", "grant"],
  swe: ["cost", "accuracy", "data", "papers", "f1", "grant"],
  systems: ["cost", "data", "accuracy", "papers", "f1", "grant"],
};

/** Short project fields for v2 cards. */
export const projectCards = {
  bitgig: {
    oneLiner: "Expert annotation for lab and medical video. Gemini drafts, verified experts correct.",
    chips: ["Human-in-the-loop", "Consensus QC", "Cloud Run"],
    icons: ["googlegemini", "googlecloud", "nextdotjs", "react", "typescript", "vercel"] as const,
  },
  drone: {
    oneLiner: "A drone that classifies crop leaves in real time from 15m up.",
    chips: ["$25,000 IEEE AESS grant", "Research Lead", "2 IEEE papers", "Patent filed"],
    specs: ["NDVI", "TensorFlow", "Quantized CNN", "NVIDIA Jetson", "15m altitude"],
    icons: ["tensorflow", "nvidia", "python"] as const,
  },
  scheduler: {
    oneLiner: "A Java calendar engine with 18+ commands, timezones, recurring events, and CSV and iCal export.",
    icons: ["openjdk"] as const,
  },
};

/**
 * The stack, as proof. Every item with an icon or a "where" is tied to a role or project
 * in the brief. Items without a confirmed "where" stay in toolkit.alsoFamiliar.
 */
export type StackItem = { name: string; icon?: import("./icons.generated").IconSlug; where: string };
export const stack: { group: string; items: StackItem[] }[] = [
  {
    group: "AI and ML",
    items: [
      { name: "LLM agents", where: "Nokia: agent for test porting" },
      { name: "MCP", icon: "modelcontextprotocol", where: "Nokia: agent tool integration" },
      { name: "GPT-4.1", where: "NSI: annotation pipeline over 1M+ papers" },
      { name: "Gemini API", icon: "googlegemini", where: "Bitgig: drafts SOP steps from video" },
      { name: "LLM evaluation", where: "Nokia: redesign after live evaluation" },
      { name: "SciBERT NER", where: "NSI: 97% F1 on research-tool extraction" },
      { name: "TensorFlow", icon: "tensorflow", where: "Drone: NDVI pipeline" },
      { name: "YOLOv9", icon: "yolo", where: "IIT Patna: modified architecture" },
      { name: "NVIDIA Jetson", icon: "nvidia", where: "Drone and IIT Patna: quantized models at the edge" },
      { name: "Prodigy", where: "NSI: annotation pipeline" },
      { name: "Cursor", icon: "cursor", where: "Nokia: agent development" },
    ],
  },
  {
    group: "Data",
    items: [
      { name: "Databricks", icon: "databricks", where: "MSCI: ETL pipelines" },
      { name: "PySpark", icon: "apachespark", where: "MSCI: ETL pipelines" },
      { name: "Pandas", icon: "pandas", where: "MSCI: ETL pipelines" },
      { name: "BigQuery", icon: "googlebigquery", where: "MSCI: 5TB moved from OracleDB" },
      { name: "OracleDB", where: "MSCI: migration source" },
      { name: "Data modeling", where: "MSCI: ETL pipelines" },
    ],
  },
  {
    group: "Cloud and DevOps",
    items: [
      { name: "GCP", icon: "googlecloud", where: "MSCI migration, Bitgig on Cloud Run" },
      { name: "Azure", where: "MSCI: migration source" },
      { name: "Kubernetes", icon: "kubernetes", where: "MSCI: 15+ APIs migrated" },
      { name: "Docker", icon: "docker", where: "MSCI: 15+ APIs migrated" },
      { name: "SonarQube", icon: "sonarqubeserver", where: "MSCI: CI/CD security scanning" },
      { name: "Vercel", icon: "vercel", where: "Bitgig: expert-review interface" },
    ],
  },
  {
    group: "Languages and backend",
    items: [
      { name: "Python", icon: "python", where: "Nokia: 50K+ line framework. NSI: annotation pipeline" },
      { name: "Java", icon: "openjdk", where: "MSCI, Event Scheduler" },
      { name: "TypeScript", icon: "typescript", where: "Bitgig" },
      { name: "Spring Boot", icon: "springboot", where: "MSCI: client-facing REST APIs" },
      { name: "JUnit", icon: "junit5", where: "MSCI: 82% test coverage" },
      { name: "Gatling", icon: "gatling", where: "MSCI: 82% test coverage" },
      { name: "React", icon: "react", where: "Bitgig" },
      { name: "Next.js", icon: "nextdotjs", where: "Bitgig, and this site" },
    ],
  },
];

export const about = {
  title: "Off the clock",
  lines: [
    "Kovida degree in Bharatanatyam, Nalanda Dance Research Center",
    "Communication Skills Grade 5, Distinction, Trinity College London",
  ],
  quote: "The hard work stays invisible. What reaches people feels effortless.",
  quoteNote: "That is how I try to build software.",
  revealLead: "One more thing. This page follows a Bharatanatyam recital.",
  revealLine: "You just watched a margam.",
};

/* ------------------------------------------------------------------ */
/* v3: the hero gag and the career pipeline                             */
/* ------------------------------------------------------------------ */

/**
 * The hero's AI draft. Deliberately absurd claims, visibly struck out by a human.
 * None of these are claims about Harshita: they are the joke, and they are crossed out.
 */
export const aiDraft = {
  label: "AI draft",
  parts: [
    { text: "Harshita is a " },
    { text: "10x ninja", note: "nope" },
    { text: "\nwith " },
    { text: "47 years of experience", note: "hallucinated" },
    { text: "." },
  ] as { text: string; note?: string }[],
  srSummary: "An AI-written draft bio full of made-up claims, crossed out by hand.",
  pending: "awaiting review",
  verified: "verified by a human",
  headline: { first: "AI writes the first draft.", second: "I make it", last: "right." },
};

export type PipelineStage = {
  id: string;
  year: string;
  name: string;
  stat: string;
  color: "green" | "teal" | "marigold" | "red" | "ink";
  icon: "drone" | "cloud" | "papers" | "agent" | "you";
  href: string;
};

/** Her career, left to right, as one pipeline. The last stage is the visitor's team. */
export const pipeline: PipelineStage[] = [
  { id: "research", year: "2023", name: "Edge ML research", stat: "$25,000 grant", color: "green", icon: "drone", href: "#ch-research" },
  { id: "msci", year: "2024", name: "MSCI", stat: "15+ APIs to GCP", color: "teal", icon: "cloud", href: "#ch-msci" },
  { id: "nsi", year: "2025", name: "Network Science Institute", stat: "60% → 98% accuracy", color: "marigold", icon: "papers", href: "#ch-nsi" },
  { id: "nokia", year: "2026", name: "Nokia", stat: "LLM agents + guardrails", color: "red", icon: "agent", href: "#ch-nokia" },
  { id: "you", year: "2027", name: "Your team?", stat: "full-time from 2027", color: "ink", icon: "you", href: "#contact" },
];

/* ------------------------------------------------------------------ */
/* v5: the island is a map of the resume.                              */
/* The hub has one district per resume section. Each district opens    */
/* into its own world: a path in time order, one step per entry.       */
/* ------------------------------------------------------------------ */

export type MargamId = "alarippu" | "jatiswaram" | "shabdam" | "varnam" | "padam" | "tillana" | "mangalam";
export type WorldId = "education" | "skills" | "experience" | "projects" | "offstage";
export type Link = { label: string; href: string; primary?: boolean };

/** The seven parts of the recital, in order, with the colour each wears on the island. */
export const margamParts: { id: MargamId; name: string; meaning: string; color: string }[] = [
  { id: "alarippu", name: "Alarippu", meaning: "the invocation", color: "#ff6b4a" },
  { id: "jatiswaram", name: "Jatiswaram", meaning: "pure technique", color: "#ffc93c" },
  { id: "shabdam", name: "Shabdam", meaning: "the story", color: "#2f5dff" },
  { id: "varnam", name: "Varnam", meaning: "the centerpiece", color: "#8e44ad" },
  { id: "padam", name: "Padam", meaning: "the personal", color: "#ff4f8b" },
  { id: "tillana", name: "Tillana", meaning: "the joyful finale", color: "#3bb273" },
  { id: "mangalam", name: "Mangalam", meaning: "the blessing", color: "#16a3a3" },
];

/** Time zones for the live clocks in each city. */
export const places = {
  mumbai: { city: "Mumbai", tz: "Asia/Kolkata" },
  boston: { city: "Boston", tz: "America/New_York" },
  sunnyvale: { city: "Sunnyvale", tz: "America/Los_Angeles" },
  berkeley: { city: "Berkeley", tz: "America/Los_Angeles" },
} as const;
export type PlaceId = keyof typeof places;

/* ---------- the hub ---------- */

export type HubStop = {
  id: string;
  margam: MargamId;
  hud: string;
  headline: string;
  stat?: string;
  /** Short scannable lines under the headline. */
  lines?: string[];
  world?: WorldId;
  hint?: string;
  links?: Link[];
};

const enter = (w: WorldId, label: string): Link => ({ label: `Enter ${label} →`, href: `/${w}`, primary: true });

export const hubStops: HubStop[] = [
  {
    id: "welcome",
    margam: "alarippu",
    hud: "Software engineer · Sunnyvale, CA",
    headline: "Harshita Jogi",
    stat: "AI writes the first draft. I make it right.",
    lines: ["SWE Co-op at Nokia · MS CS at Northeastern, May 2027"],
    hint: "Or scroll for the map of the island",
    links: [{ label: "Start the tour →", href: "/education", primary: true }],
  },
  {
    id: "education",
    margam: "jatiswaram",
    world: "education",
    hud: "01 · Education",
    headline: "Education.",
    lines: ["MS Computer Science · Northeastern · May 2027 · GPA 3.9/4.0", "BE Electronics · University of Mumbai · 2024 · GPA 9.04/10"],
    links: [enter("education", "Education")],
  },
  {
    id: "skills",
    margam: "jatiswaram",
    world: "skills",
    hud: "02 · Skills",
    headline: "Skills.",
    lines: ["LLM systems · Machine learning · Data", "Backend · Cloud & DevOps · Languages & web"],
    links: [enter("skills", "Skills")],
  },
  {
    id: "experience",
    margam: "shabdam",
    world: "experience",
    hud: "03 · Experience",
    headline: "Experience.",
    lines: ["Nokia · Software Engineer Co-op · Now", "Network Science Institute · Research Assistant", "MSCI · Technology Analyst", "IIT Patna · Research Intern"],
    links: [enter("experience", "Experience")],
  },
  {
    id: "projects",
    margam: "varnam",
    world: "projects",
    hud: "04 · Projects & research",
    headline: "Projects & research.",
    lines: ["Bitgig · Berkeley × DeepMind Hackathon", "TryBud · 2nd place, Harvard Hack-o-Ween", "Drone research · $25,000 grant · 2 IEEE papers", "Event Scheduler · Java"],
    links: [enter("projects", "Projects")],
  },
  {
    id: "offstage",
    margam: "padam",
    world: "offstage",
    hud: "05 · Off-stage",
    headline: "Also, a trained Bharatanatyam dancer.",
    stat: "The hard work stays invisible. What reaches people feels effortless.",
    links: [enter("offstage", "Off-stage")],
  },
  {
    id: "contact",
    margam: "tillana",
    hud: "06 · 2027",
    headline: "Your team, next?",
    stat: "Open to full-time roles starting 2027. Software, AI, and data teams.",
    links: [
      { label: "Email me", href: "mailto:harshitajogi2001@gmail.com", primary: true },
      { label: "Resume ↓", href: "/Harshita_Jogi_Resume.pdf" },
      { label: "LinkedIn ↗", href: "https://www.linkedin.com/in/harshita-jogi-563227215/" },
      { label: "GitHub ↗", href: "https://github.com/HarshitaJogi" },
    ],
  },
  {
    id: "outro",
    margam: "mangalam",
    hud: "One more thing",
    headline: "You just watched a margam.",
    stat: "A Bharatanatyam recital moves through seven parts, in a circle. So did this island.",
  },
];

/* ---------- the worlds ---------- */

export type Fact = { label: string; value: string };

export type WorldStep = {
  id: string;
  kind: "intro" | "item" | "next";
  /** Small line above the title: dates and place, or a section label. */
  kicker: string;
  title: string;
  /** A short name for buttons and the rail ("Next: NSI"). Defaults to the title. */
  short?: string;
  subtitle?: string;
  lede?: string;
  /** Where the live clock and the location pin point. */
  place?: PlaceId;
  where?: string;
  facts?: Fact[];
  /** One-line highlights shown on the card. The full bullets open on request. */
  highlights?: string[];
  bullets?: string[];
  chips?: string[];
  /** "Where I used it" rows, for skills. */
  used?: { where: string; what: string; href?: string }[];
  links?: Link[];
  /** Sky gradient while this step is in view: top, bottom. */
  sky: [string, string];
  night?: boolean;
  hint?: string;
};

export type World = {
  id: WorldId;
  label: string;
  margam: MargamId;
  title: string;
  description: string;
  steps: WorldStep[];
};

const SKY = {
  day: ["#ffe3b3", "#ffd6b8"] as [string, string],
  dusk: ["#b9a6ff", "#ffcfb0"] as [string, string],
  mumbai: ["#7f8fe0", "#ffb991"] as [string, string],
  boston: ["#9fd0ff", "#ffe2bf"] as [string, string],
  sunnyvale: ["#76cfff", "#fff0b0"] as [string, string],
  halloween: ["#4b3a86", "#ff9c5f"] as [string, string],
  night: ["#151c48", "#5e4a9a"] as [string, string],
  stage: ["#3a1f4f", "#c4527a"] as [string, string],
};

const role = (id: string) => work.roles.find((r) => r.id === id)!;

/** Short, single-line versions of each role's bullets. Same facts, same numbers. */
const roleHighlights: Record<string, string[]> = {
  iitp: ["Modified YOLOv9 for agricultural imagery", "86% detection accuracy", "Quantized for NVIDIA Jetson"],
  msci: ["15+ APIs from Azure to GCP", "23% lower latency, 40% lower infra cost", "5TB moved from OracleDB to BigQuery", "Spring Boot APIs at 82% test coverage"],
  nsi: ["GPT-4.1 pipeline over 1M+ biomedical papers", "Accuracy from 60% to 98% via error analysis", "97% F1 with fine-tuned SciBERT NER", "Fewer tokens with structured output schemas"],
  nokia: ["Extending a 50K+ line Python test framework", "LLM agent that automates test porting", "Staged runs, false-pass checks, human review gates"],
};
const school = (id: string) => education.schools.find((s) => s.id === id)!;
const card = (id: string) => toolkit.cards.find((c) => c.id === id)!;

const nextStep = (to: WorldId | "contact", title: string, lede: string): WorldStep => ({
  id: "next",
  kind: "next",
  kicker: to === "contact" ? "End of the tour" : "Next world",
  title,
  lede,
  sky: SKY.day,
  links:
    to === "contact"
      ? [
          { label: "Get in touch →", href: "/#contact", primary: true },
          { label: "Back to the island", href: "/" },
        ]
      : [
          { label: `Continue to ${title.replace(/\.$/, "")} →`, href: `/${to}`, primary: true },
          { label: "Back to the island", href: "/" },
        ],
});

/** Where each skill category was used, linked to the step that proves it. */
const usedHref: Record<string, string> = {
  Nokia: "/experience#nokia",
  NSI: "/experience#nsi",
  MSCI: "/experience#msci",
  "IIT Patna": "/experience#iitp",
  Drone: "/projects#drone",
  Bitgig: "/projects#bitgig",
  Coursework: "/projects#scheduler",
};

const skillStep = (id: string, sky: [string, string], night = false): WorldStep => {
  const c = card(id);
  return {
    id,
    kind: "item",
    kicker: "Skills",
    title: c.title,
    chips: [...c.skills],
    used: c.used.map((u) => ({ ...u, href: usedHref[u.where] })),
    sky,
    night,
  };
};

export const worlds: Record<WorldId, World> = {
  education: {
    id: "education",
    label: "Education",
    margam: "jatiswaram",
    title: "Education.",
    description: "Electronics in Mumbai, then computer science in Boston.",
    steps: [
      { id: "intro", kind: "intro", kicker: "01 · Education · 2020 to 2027", title: "Education.", lede: "Electronics in Mumbai, then computer science in Boston.", sky: SKY.day, hint: "Scroll to walk the path" },
      {
        id: "mu",
        kind: "item",
        kicker: `${school("mu").start} – ${school("mu").end} · ${school("mu").location}`,
        title: school("mu").school,
        short: "U of Mumbai",
        subtitle: school("mu").degree,
        place: "mumbai",
        where: school("mu").location,
        facts: [
          { label: "GPA", value: "9.04/10" },
          { label: "Graduated", value: "May 2024" },
        ],
        lede: "Circuits first. The drone research and both IEEE papers came out of these years.",
        links: [{ label: "See the research →", href: "/projects#drone" }],
        sky: SKY.mumbai,
      },
      {
        id: "neu",
        kind: "item",
        kicker: `${school("neu").start} – ${school("neu").end} · ${school("neu").location}`,
        title: school("neu").school,
        short: "Northeastern",
        subtitle: school("neu").degree,
        place: "boston",
        where: school("neu").location,
        facts: [
          { label: "GPA", value: "3.9/4.0" },
          { label: "Graduating", value: "May 2027" },
        ],
        chips: [...school("neu").details],
        highlights: [...school("neu").awards],
        lede: "Graduating May 2027. Until then the cap stays dashed.",
        sky: SKY.boston,
      },
      nextStep("skills", "Skills.", "Grouped by what they do, and tied to where I used each one."),
    ],
  },

  skills: {
    id: "skills",
    label: "Skills",
    margam: "jatiswaram",
    title: "Skills.",
    description: "Grouped by what they do, and tied to where I used each one.",
    steps: [
      { id: "intro", kind: "intro", kicker: "02 · Skills · six stalls", title: "Skills.", lede: "Grouped by what they do, and tied to where I used each one.", sky: SKY.day, hint: "Scroll down the market" },
      skillStep("llm", SKY.dusk),
      skillStep("ml", SKY.boston),
      skillStep("data", SKY.day),
      skillStep("backend", SKY.sunnyvale),
      skillStep("cloud", SKY.boston),
      skillStep("lang", SKY.day),
      {
        id: "also",
        kind: "item",
        kicker: "Skills",
        title: toolkit.alsoLabel,
        short: "Also familiar",
        lede: "Familiar, and not yet shown in a role or project here.",
        chips: [...toolkit.alsoFamiliar],
        sky: SKY.dusk,
      },
      nextStep("experience", "Experience.", "Four roles across three cities, from edge ML research to LLM agents."),
    ],
  },

  experience: {
    id: "experience",
    label: "Experience",
    margam: "shabdam",
    title: "Experience.",
    description: "Four roles across three cities, from edge ML research to LLM agents.",
    steps: [
      { id: "intro", kind: "intro", kicker: "03 · Experience · 2023 to now", title: "Experience.", lede: "Four roles across three cities, from edge ML research to LLM agents.", sky: SKY.day, hint: "Follow the plane" },
      ...(["iitp", "msci", "nsi", "nokia"] as const).map((id): WorldStep => {
        const r = role(id);
        const place: PlaceId | undefined = id === "msci" ? "mumbai" : id === "nsi" ? "boston" : id === "nokia" ? "sunnyvale" : undefined;
        const sky = id === "iitp" ? SKY.dusk : id === "msci" ? SKY.mumbai : id === "nsi" ? SKY.boston : SKY.sunnyvale;
        return {
          id,
          kind: "item",
          kicker: `${r.start} – ${r.end} · ${r.location}`,
          title: r.company,
          short: id === "nsi" ? "NSI" : r.company,
          subtitle: r.title,
          place,
          where: r.location,
          lede: r.framing,
          highlights: roleHighlights[id],
          bullets: r.bullets,
          chips: r.stack ?? r.chips,
          links: r.note ? [{ label: `${r.note.text} ↗`, href: r.note.href }] : undefined,
          hint: id === "nokia" ? "Press APPROVE. You are the human in the loop." : undefined,
          sky,
        };
      }),
      nextStep("projects", "Projects & research.", "Funded research, two IEEE papers, a patent filing, and two hackathons."),
    ],
  },

  projects: {
    id: "projects",
    label: "Projects",
    margam: "varnam",
    title: "Projects & research.",
    description: "Funded research, two IEEE papers, a patent filing, and two hackathons.",
    steps: [
      { id: "intro", kind: "intro", kicker: "04 · Projects & research · 2023 to 2026", title: "Projects & research.", lede: "Funded research, two IEEE papers, a patent filing, and two hackathons.", sky: SKY.day, hint: "Scroll to walk the path" },
      {
        id: "drone",
        kind: "item",
        kicker: `${drone.start} – ${drone.end} · ${drone.role}`,
        title: drone.name,
        short: "Drone research",
        subtitle: drone.funding,
        facts: [
          { label: "Grant", value: drone.grant },
          { label: "Altitude", value: "15m" },
        ],
        lede: drone.tagline,
        highlights: ["Research Lead, $25,000 IEEE AESS DSTEI grant", "Quantized CNN on a Jetson drone at 15m", "2 IEEE papers and a patent filed"],
        bullets: drone.bullets,
        chips: [...projectCards.drone.specs],
        sky: SKY.day,
      },
      {
        id: "papers",
        kind: "item",
        kicker: "2024 · IEEE SPACE",
        title: "Two papers and a patent.",
        short: "Papers & patent",
        highlights: ["Maize leaf blight detection with modified YOLOv9", "Multi-stage drone system for crop health", "Patent filed: UAV crop health monitoring"],
        bullets: [...publications.map((p) => `${p.title}. ${p.venue}, ${p.pages}.`), `${patent.status}: ${patent.title}.`],
        links: publications.map((p, i) => ({ label: `Paper ${i + 1} on IEEE Xplore ↗`, href: p.href })),
        sky: SKY.dusk,
      },
      {
        id: "trybud",
        kind: "item",
        kicker: `${hackathons.tickets[1].date} · Boston, MA`,
        title: "TryBud",
        subtitle: hackathons.tickets[1].event,
        place: "boston",
        where: "Boston, MA",
        facts: [
          { label: "Placed", value: "2nd" },
          { label: "Prize", value: "$3,600" },
        ],
        lede: `${hackathons.tickets[1].line}.`,
        hint: "Light the pumpkins",
        sky: SKY.halloween,
        night: true,
      },
      {
        id: "scheduler",
        kind: "item",
        kicker: `${scheduler.start} – ${scheduler.end} · ${scheduler.meta}`,
        title: "Event Scheduler",
        short: "Scheduler",
        subtitle: scheduler.name,
        lede: projectCards.scheduler.oneLiner,
        highlights: ["MVC engine with 18+ commands", "Timezones, recurring events, conflict detection", "CSV and iCal export"],
        bullets: scheduler.bullets,
        chips: [...scheduler.patterns],
        sky: SKY.boston,
      },
      {
        id: "bitgig",
        kind: "item",
        kicker: `${bitgig.date} · UC Berkeley`,
        title: bitgig.name,
        subtitle: bitgig.event,
        place: "berkeley",
        where: "UC Berkeley, Berkeley, CA",
        lede: bitgig.tagline,
        highlights: ["Gemini drafts SOP steps from video", "Experts correct, consensus QC agrees", "Cloud Run pipeline, Next.js review app"],
        bullets: bitgig.bullets,
        chips: [...bitgig.stack],
        links: [{ label: "Try the live demo ↗", href: bitgig.live, primary: true }],
        sky: SKY.night,
        night: true,
      },
      nextStep("offstage", "Off-stage.", "Bharatanatyam, and the rule it taught me."),
    ],
  },

  offstage: {
    id: "offstage",
    label: "Off-stage",
    margam: "padam",
    title: "Off-stage.",
    description: "Bharatanatyam, and the rule it taught me.",
    steps: [
      { id: "intro", kind: "intro", kicker: "05 · Off-stage", title: "Off-stage.", lede: "Bharatanatyam, and the rule it taught me.", sky: SKY.dusk, hint: "Scroll onto the stage" },
      {
        id: "dance",
        kind: "item",
        kicker: "Bharatanatyam",
        title: "Kovida degree.",
        short: "Bharatanatyam",
        subtitle: "Nalanda Dance Research Center",
        lede: `${about.quote} ${about.quoteNote}`,
        hint: "Ring the bells",
        sky: SKY.stage,
        night: true,
      },
      {
        id: "margam",
        kind: "item",
        kicker: "The margam",
        title: "A recital in seven parts.",
        short: "The margam",
        lede: "A Bharatanatyam recital moves through seven parts, from invocation to blessing. The island follows the same order. Each district wears its part's colour.",
        sky: SKY.dusk,
      },
      {
        id: "voice",
        kind: "item",
        kicker: "Trinity College London",
        title: "Communication Skills, Grade 5.",
        short: "Speaking",
        subtitle: "Distinction",
        lede: "Explaining the work matters as much as doing it.",
        sky: SKY.day,
      },
      nextStep("contact", "That is the whole island.", "Thanks for walking it. If your team builds AI or data systems that have to hold up, I would like to hear from you."),
    ],
  },
};

export const worldOrder: WorldId[] = ["education", "skills", "experience", "projects", "offstage"];

/** Easter eggs: the hint shown for each one still hidden, and the note in the bottle. */
export const eggCopy = {
  label: "Easter eggs",
  toast: "Easter egg found",
  hints: {
    approve: "Someone in Sunnyvale is waiting for a human.",
    bells: "Ghungroo are meant to be rung.",
    pumpkins: "It is dark at Hack-o-Ween.",
    husky: "There is a good dog in Boston.",
    trolley: "Boston's green streetcar has a bell.",
    taxi: "Mumbai traffic. Honk once.",
    chai: "Every class needs a break.",
    bottle: "Something is floating near the island.",
    lamp: "Light the lamp before the performance.",
    konami: "Old games, old codes.",
  },
  bottle: {
    title: "A message in a bottle",
    lines: [
      "Hi. You found the bottle, so you look closely at things.",
      "That is most of the job. I would like to work with people like that.",
      "There are more eggs hidden around the island.",
    ],
    sign: "Harshita",
  },
  konami: "Cheat code accepted. The island dances.",
};

/** The traveler chooser that opens the first visit, and the traveler's first words. */
export const chooserCopy = {
  welcome: "Welcome to my island",
  hi: "Hi, I'm Harshita.",
  firstSub: "Pick a travel buddy. They'll walk you through my work, one world at a time.",
  textVersion: "Skip to the text version",
  kicker: "Before we start",
  title: "Who's coming with you?",
  sub: "Pick a travel buddy. They walk the whole island with you, and cheer when you find things.",
  go: "Let's go with",
  skip: "Skip for now",
  change: "Change traveler",
  hello: (name: string) => `Hi, I'm ${name}. Press Start the tour and I'll show you around.`,
};
