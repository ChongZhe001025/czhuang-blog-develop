import * as React from "react";
import { Link } from "gatsby";
import { Seo } from "../components/SEO";
import { Layout } from "../components";
import siteData from "../data/site.json";
import postData from "../data/posts.json";
import workItems from "../data/work";
import portfolioItems from "../data/portfolio";
import { useLanguage } from "../i18n/LanguageContext";

const postUrl = (post) => `/${post.slug}/`;

const Home = () => {
    const { t } = useLanguage();
    const posts = postData.allPosts.edges.map(({ node }) => node);
    const featuredWork = workItems.filter((work) => work.featured);
    const noteOrder = ["destroy-eks-security-group", "jenkins-trivy-guide"];
    const notes = noteOrder
        .map((slug) => posts.find((post) => post.slug === slug && post.note_visible))
        .filter(Boolean);
    const site = siteData.layoutSettings.edges[0].node;

    return (
        <Layout bodyClass="home-page">
            <Seo
                title={t("Chongzhe Huang | SRE & Platform Engineer")}
                description={t("SRE and platform engineering work, projects, and technical notes by Chongzhe Huang.")}
            />
            <div className="container portfolio-home">
                <section className="portfolio-hero" aria-labelledby="hero-title">
                    <div className="portfolio-hero-copy">
                        <p className="portfolio-eyebrow">{t("SRE / PLATFORM ENGINEER")}</p>
                        <h1 id="hero-title">
                            <span>{t("Building reliable systems.")}</span>
                            <span className="portfolio-title-muted">{t("Automating what matters.")}</span>
                        </h1>
                        <p className="portfolio-intro">
                            {t("I design cloud infrastructure, build reliable delivery pipelines, and automate operational workflows across AWS, GCP, and Kubernetes.")}
                        </p>
                        <div className="portfolio-actions">
                            <Link className="portfolio-button portfolio-button-primary" to="/work/">
                                {t("Explore my work")} <span aria-hidden="true">↗</span>
                            </Link>
                            <a className="portfolio-button portfolio-button-secondary" href={site.github} target="_blank" rel="noopener noreferrer">
                                GitHub <span aria-hidden="true">↗</span>
                            </a>
                        </div>
                    </div>
                    <img className="portfolio-portrait" src="/images/profile-hero.jpg" alt="Chongzhe Huang" />
                </section>

                <section className="portfolio-stack" aria-label="Tools and technologies">
                    <span className="portfolio-stack-label">{t("Working with")}</span>
                    <ul>
                        {["AWS", "GCP", "Kubernetes", "Terraform", "GitOps", "CI/CD"].map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </section>

                <section className="portfolio-section" aria-labelledby="portfolio-title">
                    <div className="portfolio-section-heading">
                        <div>
                            <p className="portfolio-eyebrow">{t("Portfolio")}</p>
                            <h2 id="portfolio-title">{t("Open-source projects & experiments")}</h2>
                        </div>
                        <Link className="portfolio-text-link" to="/portfolio/">{t("View portfolio")} <span aria-hidden="true">↗</span></Link>
                    </div>
                    <div className="portfolio-project-list">
                        {portfolioItems.map((project) => (
                            <article className="portfolio-project" key={project.slug}>
                                <div>
                                    <h3><Link to={`/portfolio/${project.slug}/`}>{t(project.title)}</Link></h3>
                                    <p>{t(project.summary)}</p>
                                </div>
                                <Link className="portfolio-arrow-link" to={`/portfolio/${project.slug}/`} aria-label={`View ${project.title}`}>
                                    <span aria-hidden="true">↗</span>
                                </Link>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="portfolio-section portfolio-work" aria-labelledby="work-title">
                    <div className="portfolio-section-heading">
                        <div>
                            <p className="portfolio-eyebrow">{t("Selected work")}</p>
                            <h2 id="work-title">{t("Work experience")}</h2>
                        </div>
                        <Link className="portfolio-text-link" to="/work/">{t("All work")} <span aria-hidden="true">↗</span></Link>
                    </div>
                    <div className="portfolio-work-grid">
                        {featuredWork.map((work) => (
                            <article className="portfolio-work-card" key={work.id}>
                                <p className="portfolio-case-meta">{t("CASE STUDY")} {work.id} <span>·</span> {t(work.category).toUpperCase()}</p>
                                <h3><Link to={`/work/${work.slug}/`}>{t(work.title)}</Link></h3>
                                <p className="portfolio-work-summary">{t(work.summary)}</p>
                                <p className="portfolio-work-status">{t(work.status)} · {t(work.statusDetail)}</p>
                                <Link className="portfolio-text-link" to={`/work/${work.slug}/`}>{t("Read case study")} <span aria-hidden="true">↗</span></Link>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="portfolio-section" aria-labelledby="focus-title">
                    <div className="portfolio-section-heading">
                        <div>
                            <p className="portfolio-eyebrow">{t("Focus areas")}</p>
                            <h2 id="focus-title">{t("Core areas")}</h2>
                        </div>
                    </div>
                    <div className="portfolio-focus-grid">
                        <div><h3>{t("Cloud infrastructure")}</h3><span>AWS · GCP · Terraform</span></div>
                        <div><h3>{t("Platform & delivery")}</h3><span>Kubernetes · GitOps · CI/CD</span></div>
                        <div><h3>{t("Reliability & security")}</h3><span>Observability · IAM · Network controls</span></div>
                    </div>
                </section>

                <section className="portfolio-section portfolio-notes" aria-labelledby="notes-title">
                    <div className="portfolio-section-heading">
                        <div>
                            <p className="portfolio-eyebrow">{t("Engineering notes")}</p>
                            <h2 id="notes-title">{t("Writing from the work.")}</h2>
                        </div>
                        <Link className="portfolio-text-link" to="/note/">{t("All writing")} <span aria-hidden="true">↗</span></Link>
                    </div>
                    <div className="portfolio-note-list">
                        {notes.map((note) => (
                            <article className="portfolio-note" key={note.slug}>
                                <Link to={postUrl(note)}>{t(note.title)}</Link>
                                <span>{note.note_tech_type.name.split("#").filter(Boolean).map((tag) => tag.trim()).join(" · ")}</span>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="portfolio-contact" aria-labelledby="contact-title">
                    <div>
                        <p className="portfolio-eyebrow">{t("Contact")}</p>
                        <h2 id="contact-title">{t("Let's connect.")}</h2>
                    </div>
                    <a className="portfolio-button portfolio-button-primary" href={site.gmail}>{t("Get in touch")} <span aria-hidden="true">↗</span></a>
                </section>
            </div>
        </Layout>
    );
};

export default Home;
