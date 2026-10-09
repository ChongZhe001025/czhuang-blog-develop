import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "gatsby";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Seo } from "../components/SEO";
import { Layout } from "../components";
import postData from "../data/posts.json";
import writingArticles from "../data/writingArticles.json";
import { useLanguage } from "../i18n/LanguageContext";
import { translateArticleMarkdown } from "../i18n/articleTranslations";

const getPlainText = (children) => React.Children.toArray(children).map((child) => {
    if (typeof child === "string" || typeof child === "number") return String(child);
    return getPlainText(child.props?.children || "");
}).join("");

const getHeadingId = (text) => text.trim().toLowerCase().replace(/\s+/g, "-");

const getHeadings = (markdown) => {
    let inCodeBlock = false;
    return markdown.split("\n").reduce((headings, line) => {
        if (line.trimStart().startsWith("```")) {
            inCodeBlock = !inCodeBlock;
            return headings;
        }
        if (inCodeBlock) return headings;

        const match = line.match(/^##\s+(.+)$/);
        if (match) {
            const text = match[1].replace(/[`*_~]/g, "").trim();
            headings.push({ text, id: getHeadingId(text) });
        }
        return headings;
    }, []);
};

const Post = ({ location, pageContext }) => {
    const { language, t } = useLanguage();
    const { slug, markdown: pageMarkdown, writingArticle: pageArticle } = pageContext;
    const postEdge = postData.allPosts.edges.find((edge) => edge.node.slug === slug);
    const article = writingArticles.find((item) => item.slug === slug) || pageArticle;
    const post = useMemo(() => postEdge
        ? postEdge.node
        : article
            ? { title: article.title, excerpt: article.summary, slug }
            : null, [postEdge, article, slug]);

    const [content, setContent] = useState("");
    const [headings, setHeadings] = useState([]);

    useEffect(() => {
        let cancelled = false;
        const markdownPromise = pageMarkdown
            ? Promise.resolve(pageMarkdown)
            : post?.html
                ? fetch(post.html).then((response) => {
                    if (!response.ok) throw new Error(`Unable to load article (${response.status})`);
                    return response.text();
                })
                : Promise.resolve("");

        markdownPromise
            .then((markdown) => {
                const localizedMarkdown = language === "zh"
                    ? translateArticleMarkdown(slug, markdown)
                    : markdown;
                if (!cancelled) {
                    setContent(localizedMarkdown);
                    setHeadings(getHeadings(localizedMarkdown));
                }
            })
            .catch((error) => {
                if (!cancelled) console.error("Failed to load article content:", error);
            });

        return () => { cancelled = true; };
    }, [language, pageMarkdown, post, slug]);

    if (!post) {
        return (
            <Layout>
                <div className="container work-case-page">
                    <h1>{t("Post not found")}</h1>
                    <p>{t("Sorry, the post you are looking for does not exist.")}</p>
                </div>
            </Layout>
        );
    }

    const topicTags = article?.topic
        ? article.topic.split(/\s+(?:·|\/)\s+/).filter(Boolean)
        : (post.note_tech_type?.name || "").split(/\s+/).map((tag) => tag.replace(/^#/, "")).filter(Boolean);
    const summary = article?.summary || post.description || post.excerpt;

    return (
        <Layout>
            <Seo
                title={`${t(post.title)} | Chongzhe Huang`}
                description={t(summary || "Engineering case studies and technical writing by Chongzhe Huang.")}
                image={post.cover || undefined}
                pathname={location && location.pathname}
            />
            <article className="container work-case-page article-page">
                <Link className="work-back-link" to="/note/">← {t("All writing")}</Link>

                <header className="work-case-header">
                    <p className="portfolio-eyebrow">
                        {t("Technical article")}{topicTags.length > 0 && ` · ${topicTags.map(t).join(" · ")}`}
                    </p>
                    <h1>{t(post.title)}</h1>
                    {summary && <p className="work-case-summary">{t(summary)}</p>}
                    {topicTags.length > 0 && (
                        <div className="work-case-technologies">
                            {topicTags.map((tag) => <span key={tag}>{t(tag)}</span>)}
                        </div>
                    )}
                </header>

                {headings.length > 0 && (
                    <nav className="article-toc" aria-label={t("On this page")}>
                        <span className="portfolio-eyebrow">{t("On this page")}</span>
                        <ul>
                            {headings.map((heading) => (
                                <li key={heading.id}><a href={`#${heading.id}`}>{heading.text}</a></li>
                            ))}
                        </ul>
                    </nav>
                )}

                <div className="work-case-content article-content">
                    <div className="article-markdown">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h2: ({ children }) => {
                                    const id = getHeadingId(getPlainText(children));
                                    return <h2 id={id}>{children}</h2>;
                                },
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                </div>

                <footer className="work-case-footer">
                    <Link className="portfolio-text-link" to="/note/">← {t("Back to")} {t("All writing")}</Link>
                </footer>
            </article>
        </Layout>
    );
};

Post.propTypes = {
    location: PropTypes.object.isRequired,
    pageContext: PropTypes.shape({
        slug: PropTypes.string.isRequired,
        markdown: PropTypes.string,
        writingArticle: PropTypes.object,
    }).isRequired,
};

export default Post;
