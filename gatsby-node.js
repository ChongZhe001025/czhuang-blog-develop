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
    const about = data.czAboutInfo.edges;
    const posts = data.allPosts.edges;

    // Load templates
    const indexTemplate = path.resolve(`./src/templates/index.js`);
    const portfolioTemplate = path.resolve(`./src/templates/portfolio.js`);
    const noteTemplate = path.resolve(`./src/templates/note.js`);
    const aboutTemplate = path.resolve(`./src/templates/about.js`);
    const postTemplate = path.resolve(`./src/templates/post.js`);

    // Create portfolio page
    portfolio.forEach(({ node }) => {
        // permalink: `/portfolio/`
        const url = `/portfolio`;


        // Derive the list of visible portfolio posts from data
        const portfolioItems = posts.filter(
            ({ node }) => node.portfolio_visible === true
        );

        // Create pagination
        paginate({
            createPage,
            items: portfolioItems,
            itemsPerPage: postsPerPage,
            component: portfolioTemplate,
            pathPrefix: ({ pageNumber }) =>
                pageNumber === 0 ? `${url}/` : `${url}/page`,
            context: {
                slug: node.slug,
            },
        });
    });

    // Create note page
    note.forEach(({ node }) => {
        // permalink: `/note/`
        const url = `/note`;


        // Derive the list of visible note posts from data
        const noteItems = posts.filter(({ node }) => node.note_visible === true);

        // Create pagination
        paginate({
            createPage,
            items: noteItems,
            itemsPerPage: postsPerPage,
            component: noteTemplate,
            pathPrefix: ({ pageNumber }) =>
                pageNumber === 0 ? `${url}/` : `${url}/page`,
            context: {
                slug: node.slug,
            },
        });
    });

    // Create about page
    about.forEach(({ node }) => {
        // permalink: `/about/`
        const url = `/about`;


        // Derive the list of visible note posts from data
        const aboutItems = posts.filter(({ node }) => node.note_visible === false && node.portfolio_visible === false);

        // Create pagination
        paginate({
            createPage,
            items: aboutItems,
            itemsPerPage: postsPerPage,
            component: aboutTemplate,
            pathPrefix: ({ pageNumber }) =>
                pageNumber === 0 ? `${url}/` : `${url}/page`,
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
