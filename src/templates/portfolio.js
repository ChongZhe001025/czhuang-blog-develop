import * as React from "react";
import { Link } from "gatsby";
import { Seo } from "../components/SEO";
import { Layout } from "../components";
import portfolioItems from "../data/portfolio";
import { useLanguage } from "../i18n/LanguageContext";

const Portfolio = () => {
    const { t } = useLanguage();

    return <Layout>
        <Seo
            title={`${t("Portfolio")} | Chongzhe Huang`}
            description={t("I use FluxSeer to publish open-source projects and personal software experiments across platform reliability, cloud-native systems, automation, and web development.")}
        />
        <div className="container work-page">
            <header className="work-page-header">
                <p className="portfolio-eyebrow">{t("FluxSeer · Independent projects")}</p>
                <h1>{t("Portfolio")}</h1>
                <p>{t("I use FluxSeer to publish open-source projects and personal software experiments across platform reliability, cloud-native systems, automation, and web development.")}</p>
            </header>

            <section className="work-group portfolio-group" aria-labelledby="portfolio-projects-heading">
                <div className="work-group-heading">
                    <h2 id="portfolio-projects-heading">{t("Open-source projects & experiments")}</h2>
                    <div className="portfolio-group-actions">
                        <span>{String(portfolioItems.length).padStart(2, "0")}</span>
                        <a className="portfolio-text-link" href="https://github.com/FluxSeer" target="_blank" rel="noopener noreferrer">
                            {t("Visit the FluxSeer organization")} <span aria-hidden="true">↗</span>
                        </a>
                    </div>
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
                                        <span className="work-status">{t(item.status)}{item.statusDetail ? ` · ${t(item.statusDetail)}` : ""}</span>
                                    </div>
                                    <h3><Link to={detailUrl}>{t(item.title)}</Link></h3>
                                    <p>{t(item.summary)}</p>
                                    <div className="work-tech-list">{item.technologies.join(" · ")}</div>
                                </div>
                                <Link className="work-list-arrow" to={detailUrl} aria-label={`${t("Read")} ${t(item.title)}`}>
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
