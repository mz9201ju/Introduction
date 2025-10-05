export const profile = {
    image: "./OMER_ZAHID.jpeg",
    name: "Omer Zahid",
    title: "Senior Software Engineer — AI‑enabled Systems",
    blurb:
        "Full‑stack engineer shipping enterprise‑scale, AI‑powered solutions. Obsessed with latency, resilience, and clean CI/CD.",
    links: {
        linkedin: "https://linkedin.com/in/omer-zahid-developer",
        email: "omer.zahid@mnsu.edu"
    },
    skills: [
        "Java", "Spring Boot", "React", "Redux", "Python", "SQL",
        "Docker", "Kubernetes", "OpenShift", "AKS", "Azure DevOps",
        "Jenkins", "Maven", "Git", "Dynatrace", "Splunk"
    ],
    experience: [
        {
            company: "Costco Wholesale",
            role: "Senior Software Engineer",
            time: "Oct 2019 – Present | Issaquah, WA",
            bullets: [
                "Modernized payment APIs; integrated Apple Pay; improved P95 from 500ms+ to less than 300ms.",
                "Tech lead for Enterprise Services; grew engineers and aligned delivery to roadmap.",
                "Resolved 200+ prod incidents using Copilot/Dynatrace playbooks; improved reliability.",
                "Engineered scalable REST APIs for Jewelry platform; supported high throughput.",
                "Drove Docker/OpenShift adoption; env setup cut from hours to <30 min.",
                "Maintained legacy WebSphere/SOAP with 99.99% uptime during migrations."
            ]
        },
        {
            company: "Express Scripts",
            role: "Full‑Stack Developer",
            time: "Nov 2016 – Oct 2019 | Franklin Lakes, NJ",
            bullets: [
                "Built React/Redux + Spring Boot apps for 5+ business units (10k+ daily users).",
                "Python tooling to validate Oracle↔DB2 replication (1M+ records/week).",
                "Migrated QA from HP UFT to Selenium‑Java; saved ~$50k/yr; better coverage.",
                "CI/CD with Git/Jenkins/test gates; integrated Sauce Labs + Jira."
            ]
        }
    ]
};