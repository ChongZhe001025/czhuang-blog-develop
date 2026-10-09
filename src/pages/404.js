import * as React from "react";
import { Link } from "gatsby";
import { Layout } from "../components";
import { Seo } from "../components/SEO";
import { useLanguage } from "../i18n/LanguageContext";

const NotFoundPage = () => {
    const { t } = useLanguage();

    return <Layout>
    <Seo title="404: Not found" description={t("Page not found - Chongzhe Huang")} />
        <div className="container">
            <article className="content" style={{ textAlign: `center` }}>
                <h1 className="content-title">Error 404</h1>
                <section className="content-body">
                    {t("Page not found,")} <Link to="/">{t("return home")}</Link>{t(" to start over")}
                </section>
            </article>
        </div>
    </Layout>;
};

export default NotFoundPage;
