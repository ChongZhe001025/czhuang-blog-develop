/* eslint-disable semi */
/* eslint-disable no-unsafe-finally */
/* eslint-disable no-restricted-syntax */

const path = require("path");
const remarkGfm = require("remark-gfm");

const config = {
    siteMetadata: {
        siteUrl: process.env.SITEURL || 'https://blog.czhuang.dev/',
        title: 'Chongzhe Huang | Platform Engineering & SRE',
        description: 'I build secure, reliable cloud platforms and delivery workflows that help engineering teams ship with confidence.',
        author: 'Chongzhe Huang',
        image: '/logo.png',
        twitterUsername: '@your_twitter',
    },
    // Avoid potential 404 page-data write issues; keep author-defined slashes
    trailingSlash: 'ignore',
    plugins: [
        `gatsby-plugin-sharp`,
        {
            resolve: `gatsby-plugin-manifest`,
            options: {
              name: 'Chongzhe Huang | Platform Engineering & SRE',
              short_name: 'Chongzhe Huang',
              start_url: '/',
              background_color: `#e9e9e9`,
              theme_color: `#15171A`,
              display: `minimal-ui`,
              icon: 'static/logo.png',
              legacy: true,
            },
        },
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                path: path.join(__dirname, `src`, `pages`),  // __dirname 在 CommonJS 可用
                name: `pages`,
            },
        },
        {
            resolve: `gatsby-source-filesystem`,
            options: {
                path: path.join(__dirname, `src`, `images`),
                name: `images`,
            },
        },
        {
            resolve: `gatsby-plugin-mdx`,
            options: {
                extensions: [`.mdx`, `.md`],
                gatsbyRemarkPlugins: [
                    {
                        resolve: `gatsby-remark-images`,
                        options: {
                            maxWidth: 800,
                        },
                    },
                ],
                mdxOptions: {
                    remarkPlugins: [remarkGfm],
                },
            },
        },
        `gatsby-plugin-image`,
        `gatsby-transformer-sharp`,
        `gatsby-plugin-catch-links`,
        `gatsby-plugin-react-helmet`,
        {
            resolve: `gatsby-plugin-sitemap`,
            options: {
                output: `/sitemap.xml`,
            },
        },
        {
            resolve: `gatsby-plugin-robots-txt`,
            options: {
                policy: [{ userAgent: '*', allow: '/' }],
            },
        },
        `gatsby-plugin-offline`,
    ]
};

module.exports = config; 
