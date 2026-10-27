import * as React from "react";
import { Link } from "gatsby";
import { Layout } from "../components";
import { Seo } from "../components/SEO";
import { useLanguage } from "../i18n/LanguageContext";

const NotFoundPage = () => {
    const { t } = useLanguage();

    return <Layout>
    <Seo title="404: Not found" description={t("Page not found - Chongzhe Huang")} />
        <div className="container work-page not-found-page">
            <header className="work-page-header">
                <p className="portfolio-eyebrow">404</p>
                <h1>{t("404: Not found")}</h1>
                <p>
                    {t("Page not found,")} <Link className="portfolio-text-link" to="/">{t("return home")}</Link>{t(" to start over")}
                </p>
            </header>
        </div>
    </Layout>;
};

export default NotFoundPage;
