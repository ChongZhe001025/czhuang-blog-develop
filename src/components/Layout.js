import * as React from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
// import { Link } from "gatsby";
import { Navigation } from ".";
import data from "../data/blog.json";

import "../styles/app.css";

const DefaultLayout = ({ children, bodyClass, isHome }) => {
    const site = data.layoutSettings.edges[0].node;

    const githubUrl = site.github;
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
                <html lang={site.lang} />
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
                        style={{
                            ...(site.cover_image && {
                                backgroundImage: `url(${site.cover_image})`,
                            }),
                        }}
                    >
                        <div className="container">
                            <div className="site-mast">
                                <div className="site-mast-left">
                                </div>
                                <div className="site-mast-right">
                                    
                                </div>
                            </div>
                            {isHome ? (
                                <div className="site-banner">
                                    <h1 className="site-banner-title">{site.meta_title}</h1>
                                </div>
                            ) : null}
                            <nav className="site-nav">
                                <div className="site-nav-left">
                                    <Navigation data={site.navigation} navClass="site-nav-item" />
                                </div>
                                <div className="site-nav-right">
                                    {githubUrl && (
                                        <a href={githubUrl} className="site-nav-item" target="_blank" rel="noopener noreferrer">
                                            <img
                                                className="site-nav-icon-github"
                                                src="/images/icons/github.png"
                                                alt="github"
                                            />
                                        </a>
                                    )}
                                    {linkedinUrl && (
                                        <a href={linkedinUrl} className="site-nav-item" target="_blank" rel="noopener noreferrer">
                                            <img 
                                                className="site-nav-icon-linkedin" 
                                                src="/images/icons/linkedin.png"
                                                alt="linkedin" 
                                            />
                                        </a>
                                    )}
                                    <a className="site-nav-item" href={gmailUrl} target="_blank" rel="noopener noreferrer">
                                        <img 
                                            className="site-nav-icon-gmail" 
                                            src="/images/icons/gmail.png"
                                            alt="Gmail Icon" 
                                        />
                                    </a>
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
                            <div className="site-foot-nav-left">
                                Chongzhe Huang 2025 © all rights reserved
                            </div>
                            {/* <div className="site-foot-nav-right">
                                <Link to="/"> Home </Link>
                                <Link to="/portfolio/"> Portfolio </Link>
                                <Link to="/note/"> Notes </Link>
                            </div> */}
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
    isHome: PropTypes.bool,
};

export default DefaultLayout;
