const path = require(`path`);
const fs = require(`fs`);

const siteData = require("./src/data/site.json");
const postData = require("./src/data/posts.json");
const writingArticles = require("./src/data/writingArticles.json");
const workItems = require("./src/data/work.js");
const portfolioCases = require("./src/data/portfolio.js");

/**
 * Here is the place where Gatsby creates the URLs for all the
 * posts, portfolio, pages and note that we fetched from the Ghost site.
 */
exports.createPages = async ({ actions }) => {
    const { createPage } = actions;

    // Extract query results
    const about = siteData.czAboutInfo.edges;
    const posts = postData.allPosts.edges;

    // Load templates
    const portfolioTemplate = path.resolve(`./src/templates/portfolio.js`);
    const noteTemplate = path.resolve(`./src/templates/note.js`);
    const aboutTemplate = path.resolve(`./src/templates/about.js`);
    const postTemplate = path.resolve(`./src/templates/post.js`);
    const indexTemplate = path.resolve(`./src/templates/index.js`);
    const workCaseTemplate = path.resolve(`./src/templates/work-case-study.js`);
    const workPageTemplate = path.resolve(`./src/pages/work.js`);
    const experiencePageTemplate = path.resolve(`./src/pages/experience.js`);

    const locales = [
        { code: "en", prefix: "/en" },
        { code: "zh", prefix: "/zh-Hant" },
    ];

    const createLocalizedPage = ({ pagePath, component, context = {} }) => {
        const normalizedPath = pagePath === "/" ? "/" : pagePath.replace(/\/$/, "");

        createPage({
            path: pagePath,
            component,
            context: { ...context, language: "en" },
        });

        locales.forEach(({ code, prefix }) => {
            createPage({
                path: normalizedPath === "/" ? `${prefix}/` : `${prefix}${normalizedPath}/`,
                component,
                context: { ...context, language: code },
            });
        });
    };

    // Source pages are already created by Gatsby at their legacy paths.
    // Add only localized aliases here to avoid creating duplicate legacy pages.
    [
        { pagePath: "/work/", component: workPageTemplate },
        { pagePath: "/experience/", component: experiencePageTemplate },
    ].forEach(({ pagePath, component }) => {
        const normalizedPath = pagePath.replace(/\/$/, "");
        locales.forEach(({ code, prefix }) => {
            createPage({
                path: `${prefix}${normalizedPath}/`,
                component,
                context: { language: code },
            });
        });
    });

    createLocalizedPage({
        pagePath: "/",
        component: indexTemplate,
    });

    workItems.forEach((work) => {
        if (work.detailUrl) return;

        createLocalizedPage({
            pagePath: `/work/${work.slug}/`,
            component: workCaseTemplate,
            context: { work },
        });
    });

    // Keep the portfolio independent from the Work experience case studies.
    createLocalizedPage({
        pagePath: "/portfolio/",
        component: portfolioTemplate,
    });

    portfolioCases.forEach((project) => {
        createLocalizedPage({
            pagePath: `/portfolio/${project.slug}/`,
            component: workCaseTemplate,
            context: { work: project },
        });
    });

    // Writing is curated from the selected P0/P1 article list.
    createLocalizedPage({
        pagePath: "/note/",
        component: noteTemplate,
    });

    // Generate article pages from their canonical Markdown in content/writing/articles.
    const writingSlugsWithContent = new Set();
    writingArticles.filter((article) => article.contentFile).forEach((article) => {
        const markdownPath = path.join(__dirname, article.contentFile);
        const markdown = fs.readFileSync(markdownPath, "utf8").replace(/^# .+\r?\n+/, "");
        const markdownZh = article.contentFileZh
            ? fs.readFileSync(path.join(__dirname, article.contentFileZh), "utf8").replace(/^# .+\r?\n+/, "")
            : null;
        writingSlugsWithContent.add(article.slug);

        createLocalizedPage({
            pagePath: `/${article.slug}/`,
            component: postTemplate,
            context: {
                slug: article.slug,
                markdown,
                markdownZh,
                writingArticle: {
                    title: article.title,
                    summary: article.summary,
                },
            },
        });
    });

    // About is a single author page, not a paginated article category.
    if (about.length > 0) {
        createLocalizedPage({
            pagePath: "/about/",
            component: aboutTemplate,
            context: { slug: about[0].node.slug },
        });
    }

    // Create post pages
    posts.forEach(({ node }) => {
        // Curated Writing pages use their canonical Markdown in content/writing/articles.
        if (writingSlugsWithContent.has(node.slug)) return;

        // P2 articles are removed from the public Writing section and its routes.
        if (node.writing_priority === "P2") return;

        // This part here defines, that our posts will use
        // a `/:slug/` permalink.
        node.url = `/${node.slug}/`;

        // Load Markdown-backed legacy notes at build time and pair them with an
        // optional Traditional Chinese companion under static/posts/zh-Hant/.
        let markdown;
        let markdownZh;
        if (node.html && node.html.startsWith("/posts/")) {
            const markdownPath = path.join(__dirname, "static", node.html.slice(1));
            if (fs.existsSync(markdownPath)) {
                markdown = fs.readFileSync(markdownPath, "utf8");
                const localizedPath = path.join(path.dirname(markdownPath), "zh-Hant", path.basename(markdownPath));
                if (fs.existsSync(localizedPath)) {
                    markdownZh = fs.readFileSync(localizedPath, "utf8");
                }
            }
        }

        createLocalizedPage({
            pagePath: node.url,
            component: postTemplate,
            context: {
                // Data passed to context is available
                // in page queries as GraphQL variables.
                slug: node.slug,
                markdown,
                markdownZh,
            },
        });
    });

};

// Force userland punycode to avoid Node's deprecated built-in (DEP0040)
exports.onCreateWebpackConfig = ({ actions }) => {
    actions.setWebpackConfig({
        resolve: {
            alias: {
                // Ensure any `require('punycode')` resolves to the npm package
                'punycode$': require.resolve('punycode/')
            }
        }
    });
};
