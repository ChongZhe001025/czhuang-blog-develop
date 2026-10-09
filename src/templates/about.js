import React from "react";
import PropTypes from "prop-types";
import { Link } from "gatsby";
import { Seo } from "../components/SEO";
import { Layout } from "../components";
import { useLanguage } from "../i18n/LanguageContext";

const About = () => {
    const { t } = useLanguage();

    return <Layout>
        <Seo title={`${t("About")} | Chongzhe Huang`} description={t("About Chongzhe Huang, an SRE and platform engineering professional.")} />
        <div className="container content-page">
            <header className="page-header">
                <div className="page-header-content"><p className="eyebrow">{t("About")}</p><h1>{t("How I approach infrastructure")}</h1></div>
            </header>
            <div className="content-page-body">
                <p className="lead">{t("I’m Chongzhe Huang, an SRE and platform engineering professional focused on making infrastructure safer, more reliable, and easier for engineering teams to use.")}</p>
                <p>{t("My work brings together cloud infrastructure, developer enablement, delivery automation, and security controls. I enjoy turning a collection of manual setup steps into a repeatable workflow that teams can understand and operate.")}</p>
                <h2>{t("Areas I work in")}</h2>
                <ul>
                    <li>{t("Cloud infrastructure and network boundaries")}</li>
                    <li>{t("CI/CD, branch governance, and deployment workflows")}</li>
                    <li>{t("Developer environments, observability, and operational readiness")}</li>
                    <li>{t("Infrastructure as Code, Kubernetes, and cloud-native systems")}</li>
                </ul>
                <h2>{t("What I value")}</h2>
                <p>{t("Clear ownership, changes that can be reviewed in version control, least-privilege access, and systems that are observable and recoverable.")}</p>
                <div className="home-actions">
                    <Link className="btn btn-primary" to="/work/">{t("Explore my work")}</Link>
                    <Link className="btn btn-ghost" to="/portfolio/">{t("Browse projects")}</Link>
                </div>
            </div>
        </div>
    </Layout>;
};

About.propTypes = {
    location: PropTypes.shape({ pathname: PropTypes.string.isRequired }).isRequired,
    pageContext: PropTypes.object,
};

export default About;
