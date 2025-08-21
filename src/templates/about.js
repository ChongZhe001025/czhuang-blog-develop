import React from "react";
import PropTypes from "prop-types";
import { Seo } from "../components/SEO";
import { Layout, PostCard, Pagination } from "../components";
import data from "../data/blog.json";

const About = ({ pageContext }) => {
    const posts = data.allPosts.edges;
    const { skip = 0, limit = posts.length } = pageContext || {};

    const aboutData = data.czAboutInfo.edges[0].node;

    // Show posts that are neither Note nor Portfolio
    const filteredPosts = posts.filter(({ node }) =>
        node.note_visible === false && node.portfolio_visible === false
    );

    const pagePosts = filteredPosts.slice(skip, skip + limit);

    return (
        <Layout>
                <Seo title="About | CZ-HUANG Blog" description="About the Blog Author Chongzhe Huang: Introduction and Experience" />
            <div className="container">
                <header className="page-header">
                    <div className="page-header-content">
                        <h1>{aboutData.name}</h1>
                    </div>
                </header>
                <section className="post-feed">
                    {pagePosts.length > 0 ? (
                        pagePosts.map(({ node }) => (
                            <PostCard key={node.id} post={node} />
                        ))
                    ) : (
                        <p>No posts available under this category.</p>
                    )}
                </section>
                <Pagination pageContext={pageContext} />
            </div>
        </Layout>
    );
};

About.propTypes = {
    location: PropTypes.shape({
        pathname: PropTypes.string.isRequired,
    }).isRequired,
    pageContext: PropTypes.object,
};

export default About;
