# CV of the subject

Summary: Daily life enthusiast, full stack developer and AI engineer, passionate about creating things (web apps, AI agents, homelab servers, woodwork, 3D modelling and printing, photos, LEGO, PCs, etc.).
Contact: ev@diaoev.com · Auckland, New Zealand.

## Professional Experience

Work history and employment timeline of the subject, most recent first: Software Developer at PageProof (Jun 2025 to present); Web Developer at Spark (Feb 2023 to Jun 2025); Full Stack Developer at Spark Sport (Jul 2022 to Feb 2023); Full Stack Developer at MediaWorks (Oct 2021 to Jun 2022); Research Technician at the University of Auckland (Feb 2018 to Oct 2021); Molecular Scientist at Pace Analytical Energy Services, Pittsburgh (Apr 2015 to Nov 2017); Research Assistant at the University of Oklahoma (Aug 2011 to Oct 2014). Career changed from microbiology research to software development in 2021.

### Software Developer
*PageProof, Auckland, New Zealand*  
**Jun 2025 - Present**

- Deliver features end-to-end across a 25+ microservice platform (TypeScript, Node.js, C#, React, AngularJS, Azure, Kubernetes, Azure DevOps) — partnering closely with Product, QA, Customer Success, and fellow engineers to clarify requirements, align on technical design, and ship reliably to production.
- Re-architected search and data loading on the app's main landing view onto Azure AI Search, moving indexing off the request path into a dedicated indexer service — cutting load times 50–70% on large datasets.
- Leading a full-stack, phased re-architecture to introduce a hierarchical, folder-like organization structure for content collections — spanning the database, .NET API, GraphQL gateway, SDK, and React/legacy frontends — with a fully backward-compatible rollout and an idempotent production backfill, at zero downtime.
- Architected the platform's first automated-testing foundation — a BDD end-to-end framework built from scratch (Playwright, Cucumber, TypeScript) with a Page Object Model, reusable step library, multi-tier coverage, and tagged/parallel CI execution with Allure reporting.
- Designed and built a multi-agent AI platform that takes a Jira ticket to a human-reviewed PR — a deterministic state-machine orchestrator over a durable Postgres job queue coordinating specialized LLM agents (plan-readiness gate, coding agent in an isolated git worktree, read-only security reviewer). TypeScript, Hono, PostgreSQL/Drizzle; provider-agnostic (Claude/OpenAI). Adopted by Product and QA, 100+ pull requests opened.
- Built the document-intelligence layer behind PageProof Intelligence, the customer-facing AI proof review: Azure AI Document Intelligence extracts page geometry, words, tables and figures so the review agent's findings land as pin-accurate comments on posters, packaging and artwork.
- Designed and shipped PageProof's remote MCP server, so customers connect Claude, ChatGPT or Cursor and read their own data. Secured it with OAuth 2.1 and PKCE against the company's OIDC server. Wrote the tool contract the team then extended to 10 tools, and hardened it for production on Kubernetes.
- Built a Confluence RAG assistant on the Azure AI stack: Azure AI Search with integrated vectorization, one Azure AI Foundry agent per team, and Document Intelligence. Delivered as Slack bots that multiple teams use, each limited to its own spaces by a filter the search service enforces.

### Web Developer
*Spark, Auckland, New Zealand*  
**Feb 2023 - Jun 2025**

- Modernized the MySpark billing portal with Next.js and GraphQL, delivering a streamlined and user-friendly bill management experience for all Spark users.
- Led the Universal Login Application (ULA) integration for MySpark Business, enhancing security with MFA and achieving DIA compliance.
- Maintained and enhanced ULA for Spark, Skinny, and XtraMail, ensuring consistent and reliable cross-brand login experiences.
- Designed REST APIs for MySpark Business notification systems and ULA integration, including new endpoints and updates to existing services.
- Expanded the Spark Design System by creating reusable React components with Storybook, enhancing UI consistency across projects.
- Upgraded the legacy MySpark Business portal with Web Components, enhancing usability while maintaining security protocols.
- Integrated Adobe Analytics into key user journeys to enable actionable insights and improve feature adoption.

### Full Stack Developer
*Spark Sport, Auckland, New Zealand*  
**Jul 2022 - Feb 2023**

- Solved a long-standing problem in the streaming platform using scientific methodology. Create own platform to reproduce the issue and narrow down the potential causes.
- Developed features with React, Redux and TypeScript for web streaming app.
- Maintained and developed features, monitor and handle error for Chromecast receiver app.
- Involved in new home page development with Next.js and TypeScript. Performance and SEO improvement.
- Involved in the improvement of the streaming experience (CMAF migration, DVR window shifting, etc.).
- Involved in API design using serverless functions (AWS Lambda).
- Actively involved in agile development practices, reporting and tracking the sprint progress.

### Full Stack Developer
*MediaWorks, Auckland, New Zealand*  
**Oct 2021 - Jun 2022**

- Developed radio website enhancements by creating Adobe Experience Manager components with Java and JavaScript. 
- Built and deployed over 10 radio station widgets (voting, countdowns) using HTML, CSS, JavaScript, and Node.js. 
- Authored REST APIs for web services, improving integration and performance.
- Created and deployed two internal tools with React, TypeScript, and Node.js to automate website widget creation, reducing BAU time by 90%.

### Research Technician
*University of Auckland, New Zealand*  
**Feb 2018 - Oct 2021**

- Academic literature research
- Conduct and assist with a wide range of experiments using fungi and pathogenic bacteria at PC2
- Carry out liquid chromatography-mass spectrometry (LC–MS) analysis for active fungi culture
- Develop pipelines for data analysis and data visualisation
- Developed new analytical procedures and authored Standard Operating Procedures for new systems

### Molecular Scientist
*Pace Analytical Energy Services LLC, Pittsburgh, PA, USA*  
**Apr 2015 - Nov 2017**

- Carried out and managed laboratory testing plans and procedures, and maintained accurate logbooks of all procedures
- Operated, maintained, calibrated and debugged laboratory equipment and software systems
- Independent responsible for lab equipment and supply purchasing
- Ensured the laboratory was effectively sanitised and correct level of stock maintained

### Research Assistant
*University of Oklahoma, USA*  
**Aug 2011 - Oct 2014**

- Participated in the full lifecycle of data collection, experimental design, analysis and reporting
- Prepared and wrote research papers
- Provided training to new laboratory staff

## Education

### Postgraduate Certificate in Information Technology
*University of Auckland, New Zealand*  
**2021** | GPA 9/9

### Master of Science in Microbiology
*University of Oklahoma, USA*  
**2014** | GPA 8.48/9

### Bachelor of Engineering in Light Industry Biotechnology
*Sichuan University, China*  
**2011**

## Certifications

### Microsoft Certified: Azure AI Apps & Agents Developer Associate (AI-103)
Issued Sep 2026. Covers building AI applications and agents on Azure: Azure AI Foundry, Azure AI Search, Azure OpenAI and Document Intelligence.

### AWS Certified Solutions Architect - Associate
Issued Aug 2024 · Expires Aug 2027

### Microsoft Certified: Azure Fundamentals
Issued 2022
