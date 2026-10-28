import React from "react";
import { Helmet } from "react-helmet";
import { useStaticQuery, graphql } from "gatsby";
import { useLocation } from "@reach/router";
import { localizedPath } from "../i18n/LanguageContext";

const SEO = ({ title, description, image, pathname, children }) => {
  const location = useLocation();
  const { site } = useStaticQuery(
    graphql`
      query {
        site {
          siteMetadata {
            defaultTitle: title
            defaultDescription: description
            siteUrl
            image
            twitterUsername
          }
        }
      }
    `
  );

  const {
    defaultTitle,
    defaultDescription,
    siteUrl,
    image: defaultImage,
    twitterUsername,
  } = site.siteMetadata;

  const routePath = pathname || location?.pathname || "/";
  const routeLanguage = routePath.startsWith("/zh-Hant") ? "zh" : "en";
  const siteUrlBase = siteUrl.replace(/\/$/, "");
  const canonicalPath = localizedPath(routePath, routeLanguage);
  const englishPath = localizedPath(routePath, "en");
  const chinesePath = localizedPath(routePath, "zh");

  const seo = {
    title: title || defaultTitle,
    description: description || defaultDescription,
    image: `${siteUrlBase}${image || defaultImage}`,
    url: `${siteUrlBase}${canonicalPath}`,
  };

  return (
    <Helmet title={seo.title}>
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />
      <link rel="canonical" href={seo.url} />
      <link rel="alternate" hrefLang="en" href={`${siteUrlBase}${englishPath}`} />
      <link rel="alternate" hrefLang="zh-Hant" href={`${siteUrlBase}${chinesePath}`} />
      <link rel="alternate" hrefLang="x-default" href={`${siteUrlBase}${englishPath}`} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content={twitterUsername} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      {children}
    </Helmet>
  );
};

export default SEO;
// eslint-disable-next-line import/no-default-export
export { SEO as Seo };
