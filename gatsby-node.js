const path = require(`path`);
const { postsPerPage } = require(`./src/utils/siteConfig`);
const { paginate } = require(`gatsby-awesome-pagination`);

const data = require("./src/data/blog.json");

/**
 * Here is the place where Gatsby creates the URLs for all the
 * posts, portfolio, pages and note that we fetched from the Ghost site.
 */
exports.createPages = async ({ actions }) => {
    const { createPage } = actions;

    // Extract query results
    const portfolio = data.czPortfolioInfo.edges;
    const note = data.czNoteInfo.edges;
    const posts = data.allPosts.edges;

    // Load templates
    const indexTemplate = path.resolve(`./src/templates/index.js`);
    const portfolioTemplate = path.resolve(`./src/templates/portfolio.js`);
    const noteTemplate = path.resolve(`./src/templates/note.js`);
    const postTemplate = path.resolve(`./src/templates/post.js`);

    // Create tag pages
    portfolio.forEach(({ node }) => {
        const totalPosts = node.postCount !== null ? node.postCount : 0;

        // This part here defines, that our tag pages will use
        // a `/tag/:slug/` permalink.
        const url = `/portfolio/${node.slug}`;

        const items = Array.from({ length: totalPosts });

        // Create pagination
        paginate({
            createPage,
            items: items,
            itemsPerPage: postsPerPage,
            component: portfolioTemplate,
            pathPrefix: ({ pageNumber }) =>
                pageNumber === 0 ? url : `${url}/page`,
            context: {
                slug: node.slug,
            },
        });
    });

    // Create note pages
    note.forEach(({ node }) => {
        const totalPosts = node.postCount !== null ? node.postCount : 0;

        // This part here defines, that our note pages will use
        // a `/note/:slug/` permalink.
        const url = `/note/${node.slug}`;

        const items = Array.from({ length: totalPosts });

        // Create pagination
        paginate({
            createPage,
            items: items,
            itemsPerPage: postsPerPage,
            component: noteTemplate,
            pathPrefix: ({ pageNumber }) =>
                pageNumber === 0 ? url : `${url}/page`,
            context: {
                slug: node.slug,
            },
        });
    });

    // Create post pages
    posts.forEach(({ node }) => {
        // This part here defines, that our posts will use
        // a `/:slug/` permalink.
        node.url = `/${node.slug}/`;

        createPage({
            path: node.url,
            component: postTemplate,
            context: {
                // Data passed to context is available
                // in page queries as GraphQL variables.
                slug: node.slug,
            },
        });
    });

    // Create pagination
    paginate({
        createPage,
        items: posts,
        itemsPerPage: postsPerPage,
        component: indexTemplate,
        pathPrefix: ({ pageNumber }) => {
            if (pageNumber === 0) {
                return `/`;
            } else {
                return `/page`;
            }
        },
    });
};
