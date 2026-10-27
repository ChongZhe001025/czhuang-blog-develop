import * as React from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import { Link } from "gatsby";
import { Navigation } from ".";
import siteData from "../data/site.json";
import { useLanguage } from "../i18n/LanguageContext";

import "../styles/app.css";

const DefaultLayout = ({ children, bodyClass }) => {
    const site = siteData.layoutSettings.edges[0].node;
    const { language, setLanguage, t } = useLanguage();

    const githubUrl = site.github;
    const organizationUrl = site.organization;
    const linkedinUrl = site.linkedin;
    const gmailUrl = site.gmail;

    // Measure header height for spacer (avoid content being hidden under fixed header)
    const headerRef = React.useRef(null);
    const [headerHeight, setHeaderHeight] = React.useState(0);

    React.useEffect(() => {
        const update = () => {
            if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
        };
        update();
        window.addEventListener("resize", update);
        return () => window.removeEventListener("resize", update);
    }, []);

    return (
        <>
            <Helmet>
                <html lang={language === "zh" ? "zh-Hant" : site.lang || "en"} />
                <style type="text/css">{`${site.codeinjection_styles || ""}`}</style>
                <body className={bodyClass} />
            </Helmet>
            {/* 將固定頂部高度提供為 CSS 變數，供各頁使用（如 scroll-margin-top） */}
            <style>{`:root{--site-head-offset:${headerHeight}px}`}</style>

            <div className="viewport">
                <div className="viewport-top">
                    <header
                        ref={headerRef}
                        className="site-head"
                    >
                        <div className="container">
                            <nav className="site-nav">
                                <div className="site-nav-left">
                                    <Link className="site-wordmark" to="/">
                                        Chongzhe Huang
                                    </Link>
                                    <div className="site-primary-links">
                                        <Navigation data={site.navigation} navClass="site-nav-item" />
                                    </div>
                                </div>
                                <div className="site-nav-right">
                                    <div className="site-social-links">
                                        {githubUrl && (
                                            <a href={githubUrl} className="site-social-link" target="_blank" rel="noopener noreferrer" aria-label="GitHub profile">
                                                <span className="site-social-icon site-social-icon-github" aria-hidden="true">
                                                    <img className="site-social-icon-image" src="/images/icons/github.png" alt="" />
                                                </span>
                                                <span className="site-social-label">GitHub</span>
                                            </a>
                                        )}
                                        {linkedinUrl && (
                                            <a href={linkedinUrl} className="site-social-link" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile">
                                                <span className="site-social-icon site-social-icon-linkedin" aria-hidden="true">
                                                    <img className="site-social-icon-image" src="/images/icons/linkedin.png" alt="" />
                                                </span>
                                                <span className="site-social-label">LinkedIn</span>
                                            </a>
                                        )}
                                        <a className="site-social-link" href={gmailUrl} aria-label={`${t("Email")} Chongzhe Huang`}>
                                            <span className="site-social-icon site-social-icon-gmail" aria-hidden="true">
                                                <svg className="site-social-envelope" viewBox="0 0 16 16" focusable="false">
                                                    <path d="M.05 3.555A2 2 0 0 1 2 2h12a2 2 0 0 1 1.95 1.555L8 8.414.05 3.555ZM0 4.697v7.104l5.803-3.558L0 4.697Zm6.761 4.133L.191 12.857A2 2 0 0 0 2 14h12a2 2 0 0 0 1.808-1.144L9.239 8.83 8 9.586a1 1 0 0 1-1.239 0ZM16 4.697v7.104l-5.803-3.558L16 4.697Z" />
                                                </svg>
                                            </span>
                                            <span className="site-social-label">{t("Email")}</span>
                                        </a>
                                    </div>
                                    <div className="site-language-switch" role="group" aria-label={t("Switch language")}>
                                        <button
                                            type="button"
                                            className="site-language-button"
                                            aria-pressed={language === "en"}
                                            onClick={() => setLanguage("en")}
                                        >
                                            EN
                                        </button>
                                        <button
                                            type="button"
                                            className="site-language-button"
                                            aria-pressed={language === "zh"}
                                            onClick={() => setLanguage("zh")}
                                        >
                                            繁中
                                        </button>
                                    </div>
                                    {/* <Link className="site-nav-button" to="/about">
                                        About
                                    </Link> */}
                                </div>
                            </nav>
                        </div>
                    </header>

                    {/* Spacer to offset fixed header */}
                    <div style={{ height: headerHeight }} aria-hidden="true" />
                    <main className="site-main">
                        {children}
                    </main>
                </div>

                <div className="viewport-bottom">
                    <footer className="site-foot">
                        <div className="site-foot-nav container">
                            <div className="site-foot-nav-left">© 2026 Chongzhe Huang</div>
                            <div className="site-foot-nav-right">
                                <a href={githubUrl} target="_blank" rel="noopener noreferrer">GitHub</a>
                                {organizationUrl && <a href={organizationUrl} target="_blank" rel="noopener noreferrer">{t("Open source")}</a>}
                                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                                <a href={gmailUrl}>{t("Email")}</a>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
};

DefaultLayout.propTypes = {
    children: PropTypes.node.isRequired,
    bodyClass: PropTypes.string,
};

export default DefaultLayout;
