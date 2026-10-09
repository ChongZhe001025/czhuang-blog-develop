import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "gatsby";
import { Seo } from "../components/SEO";
import { Layout } from "../components";
import articles from "../data/writingArticles.json";
import { useLanguage } from "../i18n/LanguageContext";

const getTechTags = (article) =>
    article.topic
        .split(/\s+(?:·|\/)\s+/)
        .filter(Boolean)
        .map((tag) => tag.trim());

// Editorial metadata controls ordering only; priority labels are not rendered.
const priorityOrder = { P0: 0, P1: 1 };

const Note = () => {
    const { t } = useLanguage();
    const selectedArticles = [...articles].sort((a, b) =>
        (priorityOrder[a.priority] - priorityOrder[b.priority]) || a.rank - b.rank
    );
    const techTypes = [...new Set(selectedArticles.flatMap(getTechTags))];
    const [selectedTech, setSelectedTech] = useState("all");

    const filteredArticles = selectedArticles.filter((article) =>
        selectedTech === "all" || getTechTags(article).includes(selectedTech)
    );
    const pageArticles = filteredArticles;

    return (
        <Layout>
            <Seo
                title={`${t("Writing")} | Chongzhe Huang`}
                description={t("Engineering notes from hands-on work across cloud infrastructure, Kubernetes, CI/CD, reliability, and application systems.")}
            />
            <div className="container work-page writing-page">
                <header className="work-page-header">
                    <p className="portfolio-eyebrow">{t("Engineering notes")}</p>
                    <h1>{t("Writing")}</h1>
                    <p>{t("Notes on cloud infrastructure, Kubernetes, CI/CD, reliability, and application systems.")}</p>
                </header>

                <section className="work-group" aria-labelledby="writing-list-heading">
                    <div className="work-group-heading">
                        <h2 id="writing-list-heading">{t("Technical articles")}</h2>
                        <div className="writing-group-tools">
                            <label className="visually-hidden" htmlFor="writing-topic-filter">
                                {t("Filter articles by topic")}
                            </label>
                            <select
                                id="writing-topic-filter"
                                className="writing-topic-filter"
                                value={selectedTech}
                                onChange={(event) => setSelectedTech(event.target.value)}
                            >
                                <option value="all">{t("All topics")}</option>
                                {techTypes.map((tech) => (
                                    <option key={tech} value={tech}>{tech}</option>
                                ))}
                            </select>
                            <span>{String(filteredArticles.length).padStart(2, "0")}</span>
                        </div>
                    </div>

                    <div className="work-list">
                        {pageArticles.length > 0 ? pageArticles.map((article, index) => {
                            const articleUrl = article.slug ? `/${article.slug}/` : null;
                            const articleNumber = index + 1;

                            return (
                                <article className="work-list-item" key={article.slug || article.title}>
                                    <div className="work-list-number">{String(articleNumber).padStart(2, "0")}</div>
                                    <div className="work-list-body">
                                        <div className="work-list-meta">
                                            <span>{t("Technical note")}</span>
                                        </div>
                                        <h3>
                                            {articleUrl
                                                ? <Link to={articleUrl}>{t(article.title)}</Link>
                                                : t(article.title)}
                                        </h3>
                                        <p>{t(article.summary)}</p>
                                        <div className="work-tech-list">{getTechTags(article).map(t).join(" · ")}</div>
                                    </div>
                                    {articleUrl && (
                                        <Link
                                            className="work-list-arrow"
                                            to={articleUrl}
                                            aria-label={`${t("Read")} ${t(article.title)}`}
                                        >
                                            <span aria-hidden="true">↗</span>
                                        </Link>
                                    )}
                                </article>
                            );
                        }) : (
                            <p className="writing-empty-state">{t("No articles found for this topic.")}</p>
                        )}
                    </div>
                </section>

            </div>
        </Layout>
    );
};

Note.propTypes = {
    location: PropTypes.shape({
        pathname: PropTypes.string.isRequired,
    }).isRequired,
};

export default Note;
