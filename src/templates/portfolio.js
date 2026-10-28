import * as React from "react";
import { Link } from "gatsby";
import { Seo } from "../components/SEO";
import { Layout } from "../components";
import portfolioItems from "../data/portfolio";
import { localizedPath, useLanguage } from "../i18n/LanguageContext";

const Portfolio = () => {
    const { language, t } = useLanguage();

    return <Layout>
        <Seo
            title={`${t("Independent projects")} | Chongzhe Huang`}
            description={t("Open-source projects and experiments across platform reliability, cloud-native systems, automation, and web development.")}
        />
        <div className="container work-page">
            <header className="work-page-header">
                <a
                    className="portfolio-eyebrow portfolio-eyebrow-link"
                    href="https://github.com/FluxSeer"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    FluxSeer
                </a>
                <h1>{t("Independent projects")}</h1>
                <p>{t("Open-source projects and experiments across platform reliability, cloud-native systems, automation, and web development.")}</p>
            </header>

            <section className="work-group portfolio-group" aria-labelledby="portfolio-projects-heading">
                <div className="work-group-heading">
                    <h2 id="portfolio-projects-heading">{t("Project index")}</h2>
                </div>
                <div className="work-list">
                    {portfolioItems.map((item) => {
                        const detailUrl = `/portfolio/${item.slug}/`;
                        return (
                            <article className="work-list-item" key={item.slug}>
                                <div className="work-list-number">{item.id}</div>
                                <div className="work-list-body">
                                    <div className="work-list-meta">
                                        <span>{t(item.discipline)}</span>
                                    </div>
                                    <h3><Link to={localizedPath(detailUrl, language)}>{t(item.title)}</Link></h3>
                                    {item.repositoryUrl && (
                                        <a
                                            className="work-status-link work-list-status"
                                            href={item.repositoryUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={`${t(item.status)}${item.statusDetail ? ` · ${t(item.statusDetail)}` : ""} — ${t(item.title)}`}
                                        >
                                            {t(item.status)}{item.statusDetail ? ` · ${t(item.statusDetail)}` : ""}
                                        </a>
                                    )}
                                    <p>{t(item.summary)}</p>
                                </div>
                                <Link className="work-list-arrow" to={localizedPath(detailUrl, language)} aria-label={`${t("Read")} ${t(item.title)}`}>
                                    <span aria-hidden="true">↗</span>
                                </Link>
                            </article>
                        );
                    })}
                </div>
            </section>
        </div>
    </Layout>;
};

export default Portfolio;
