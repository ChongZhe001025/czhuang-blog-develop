import * as React from "react";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet";
import { Link } from "gatsby";
import { Navigation } from ".";
import data from "../data/blog.json";

import "../styles/app.css";

const DefaultLayout = ({ children, bodyClass, isHome }) => {
    const site = data.layoutSettings.edges[0].node;

    const githubUrl = site.github;
    const linkedinUrl = site.linkedin;
    const gmailUrl = site.gmail;

    return (
        <>
            <Helmet>
                <html lang={site.lang} />
                <style type="text/css">{`${site.codeinjection_styles || ""}`}</style>
                <body className={bodyClass} />
            </Helmet>

            <div className="viewport">
                <div className="viewport-top">
                    <header
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
                                </div>
                            </div>
                            {isHome ? (
                                <div className="site-banner">
                                    <h1 className="site-banner-title">{site.meta_title}</h1>
                                    <p className="site-banner-desc">{site.description}</p>
                                </div>
                            ) : null}
                            <nav className="site-nav">
                                <div className="site-nav-left">
                                    <Navigation data={site.navigation} navClass="site-nav-item" />
                                </div>
                                <div className="site-nav-right">
                                    {/* <Link className="site-nav-button" to="/about">
                                        About
                                    </Link> */}
                                </div>
                            </nav>
                        </div>
                    </header>

                    <main className="site-main">
                        {children}
                    </main>
                </div>

                <div className="viewport-bottom">
                    <footer className="site-foot">
                        <div className="site-foot-nav container">
                            <div className="site-foot-nav-left">
                                {site.title} - by Chongzhe Huang
                            </div>
                            <div className="site-foot-nav-right">
                                <Link to="/"> 🏠</Link>
                                <Link to="/portfolio/read-portfolio/"> 🚀</Link>
                                <Link to="/note/read-note/"> 📖</Link>
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
    isHome: PropTypes.bool,
};

export default DefaultLayout;
