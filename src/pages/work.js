import React from "react";
import { Link } from "gatsby";
import { Seo } from "../components/SEO";
import { Layout } from "../components";
import workItems from "../data/work";
import { useLanguage } from "../i18n/LanguageContext";

const categories = [...new Set(workItems.map((item) => item.category))];

const Work = () => {
    const { t } = useLanguage();

    return <Layout>
        <Seo
            title={`${t("Work")} | Chongzhe Huang`}
            description={t("Selected engineering projects from my SRE and platform engineering work.")}
        />
        <div className="container work-page">
            <header className="work-page-header">
                <p className="portfolio-eyebrow">{t("Selected engineering work")}</p>
                <h1>{t("Work")}</h1>
                <p>{t("Selected engineering projects from my SRE and platform engineering work.")}</p>
            </header>

            {categories.map((category) => {
                const items = workItems.filter((item) => item.category === category);
                if (!items.length) return null;

                return (
                    <section className="work-group" key={category} aria-labelledby={`work-${category.toLowerCase().replaceAll(/[^a-z]+/g, "-")}`}>
                        <div className="work-group-heading">
                            <h2 id={`work-${category.toLowerCase().replaceAll(/[^a-z]+/g, "-")}`}>{t(category)}</h2>
                            <span>{String(items.length).padStart(2, "0")}</span>
                        </div>
                        <div className="work-list">
                            {items.map((item) => {
                                const detailUrl = item.detailUrl || `/work/${item.slug}/`;
                                return (
                                    <article className="work-list-item" key={item.slug}>
                                        <div className="work-list-number">{item.id}</div>
                                        <div className="work-list-body">
                                            <div className="work-list-meta">
                                                <span>{t(item.discipline)}</span>
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
                );
            })}
        </div>
    </Layout>;
};

export default Work;
