import React from "react";
import PropTypes from "prop-types";
import { Link } from "gatsby";
import { Seo } from "../components/SEO";
import { Layout } from "../components";
import { useLanguage } from "../i18n/LanguageContext";
import { localizeCaseStudy } from "../i18n/caseStudyTranslations";

const WorkCaseStudy = ({ pageContext }) => {
    const { language, t } = useLanguage();
    const { work } = pageContext;
    const content = localizeCaseStudy(work, language);
    const collectionPath = work.collectionPath || "/work/";
    const collectionLabel = t(work.collectionLabel || "All work");

    return (
        <Layout>
            <Seo
                title={`${t(work.title)} | Chongzhe Huang`}
                description={t(work.summary)}
            />
            <article className="container work-case-page">
                <Link className="work-back-link" to={collectionPath}>← {collectionLabel}</Link>
                <header className="work-case-header">
                    <p className="portfolio-eyebrow">{t("CASE STUDY")} {work.id} · {t(work.category)}</p>
                    <h1>{t(work.title)}</h1>
                    {work.subtitle && <p className="work-case-deck">{t(work.subtitle)}</p>}
                    <p className="work-case-summary">{t(work.summary)}</p>
                    <div className="work-case-status">
                        <span>{t(work.status)}</span>
                        {work.statusDetail && <span>{t(work.statusDetail)}</span>}
                    </div>
                    <div className="work-case-technologies">
                        {work.technologies.map((technology) => <span key={technology}>{technology}</span>)}
                    </div>
                    {work.repositoryUrl && (
                        <div className="work-case-links">
                            <a className="portfolio-text-link" href={work.repositoryUrl} target="_blank" rel="noopener noreferrer">
                                {t("View source on GitHub")} <span aria-hidden="true">↗</span>
                            </a>
                        </div>
                    )}
                </header>

                <div className="work-case-content">
                    <section className="work-case-section">
                        <h2>{t("Engineering challenge")}</h2>
                        <p>{content.challenge}</p>
                    </section>

                    <section className="work-case-section">
                        <h2>{t("Architecture & design")}</h2>
                        <ul>{content.architecture.map((item) => <li key={item}>{item}</li>)}</ul>
                        {content.diagram && (
                            <figure className="work-diagram">
                                <figcaption>{t(content.diagramCaption || "Workflow at a glance")}</figcaption>
                                <ol>
                                    {content.diagram.map((step, index) => (
                                        <li key={step}>
                                            <span className="work-diagram-index">{String(index + 1).padStart(2, "0")}</span>
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </figure>
                        )}
                    </section>

                    {content.sharedEnvironment && (
                        <section className="work-case-section">
                            <h2>{t("Shared development environment")}</h2>
                            <p>{content.sharedEnvironment.summary}</p>
                            <ul>{content.sharedEnvironment.controls.map((item) => <li key={item}>{item}</li>)}</ul>
                            <figure className="work-diagram">
                                <figcaption>{t(content.sharedEnvironment.diagramCaption || "Shared development-site request path")}</figcaption>
                                <ol>
                                    {content.sharedEnvironment.diagram.map((step, index) => (
                                        <li key={step}>
                                            <span className="work-diagram-index">{String(index + 1).padStart(2, "0")}</span>
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </figure>
                        </section>
                    )}

                    {content.dataTables && (
                        <section className="work-case-section work-data-tables">
                            <h2>{t("Policy & schedule details")}</h2>
                            {content.dataTables.map((table) => (
                                <div className="work-data-table" key={table.title}>
                                    <h3>{t(table.title)}</h3>
                                    {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Keep horizontal tables keyboard-scrollable. */}
                                    <div className="work-data-table-scroll" role="region" aria-label={`${t(table.title)} table`} tabIndex={0}>
                                        <table>
                                            <thead>
                                                <tr>{table.headers.map((header) => <th key={header} scope="col">{t(header)}</th>)}</tr>
                                            </thead>
                                            <tbody>
                                                {table.rows.map((row, rowIndex) => (
                                                    <tr key={`${table.title}-${rowIndex}`}>
                                                        {row.map((cell, cellIndex) => (
                                                            cellIndex === 0
                                                                ? <th key={`${rowIndex}-${cellIndex}`} scope="row">{t(cell)}</th>
                                                                : <td key={`${rowIndex}-${cellIndex}`}>{t(cell)}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </section>
                    )}

                    <section className="work-case-section">
                        <h2>{t("Implementation")}</h2>
                        <ul>{content.implementation.map((item) => <li key={item}>{item}</li>)}</ul>
                    </section>

                    {content.operationalLessons && (
                        <section className="work-case-section">
                            <h2>{t("Operational findings")}</h2>
                            <ul>{content.operationalLessons.map((item) => <li key={item}>{item}</li>)}</ul>
                        </section>
                    )}

                    <section className="work-case-section">
                        <h2>{t("Validation & impact")}</h2>
                        <ul>{content.validation.map((item) => <li key={item}>{item}</li>)}</ul>
                    </section>

                    <section className="work-case-section">
                        <h2>{t("Limitations & next steps")}</h2>
                        <ul>{content.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
                    </section>

                    <aside className="work-value-note">
                        <span className="portfolio-eyebrow">{t("Engineering focus")}</span>
                        <p>{content.portfolioValue}</p>
                    </aside>
                </div>

                <footer className="work-case-footer">
                    <Link className="portfolio-text-link" to={collectionPath}>← {t("Back to")} {collectionLabel}</Link>
                </footer>
            </article>
        </Layout>
    );
};

WorkCaseStudy.propTypes = {
    pageContext: PropTypes.shape({
        work: PropTypes.object.isRequired,
    }).isRequired,
};

export default WorkCaseStudy;
