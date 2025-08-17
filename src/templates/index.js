import React from "react";
import PropTypes from "prop-types";

import { Layout, PostCard, Pagination } from "../components";
import data from "../data/blog.json";

const Index = ({ pageContext }) => {
    const posts = data.allPosts.edges;

    return (
        <Layout isHome={true}>
            <div className="container">
                <section className="post-feed">
                    {posts.map(({ node }) => (
                        <PostCard key={node.id} post={node} />
                    ))}
                </section>
                <Pagination pageContext={pageContext} />
            </div>
        </Layout>
    );
};

Index.propTypes = {
    location: PropTypes.shape({
        pathname: PropTypes.string.isRequired,
    }).isRequired,
    pageContext: PropTypes.object,
};

export default Index;
