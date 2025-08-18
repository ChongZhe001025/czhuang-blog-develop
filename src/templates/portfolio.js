import * as React from "react";
import PropTypes from "prop-types";
import { Layout, PostCard, Pagination } from "../components";
import data from "../data/blog.json";

const Portfolio = ({ pageContext }) => {
    const posts = data.allPosts.edges;
    const { skip = 0, limit = posts.length } = pageContext || {};

    const portfolioData = data.czPortfolioInfo.edges[0].node;
    
    const techTypes = [...new Set(posts.flatMap(({ node }) => node.portfolio_tech_type.name.split("、")))].filter(Boolean);
    const [selectedTech, setSelectedTech] = React.useState("all");

    const filteredPosts = posts.filter(({ node }) =>
        node.portfolio_visible === true &&
        (selectedTech === "all" || node.portfolio_tech_type.name.includes(selectedTech))
    );

    const pagePosts = filteredPosts.slice(skip, skip + limit);

    return (
        <Layout>
            <div className="container">
                <header className="page-header">
                    <div className="page-header-content">
                        <h1>{portfolioData.name}</h1>
                    </div>
                </header>
                <div className="filter-container">
                    <select
                        id="tech-select"
                        value={selectedTech}
                        onChange={(e) => setSelectedTech(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Tech Types</option>
                        {techTypes.map((tech) => (
                            <option key={tech} value={tech}>
                                {tech}
                            </option>
                        ))}
                    </select>
                </div>
                <section className="post-feed">
                    {pagePosts.length > 0 ? (
                        pagePosts.map(({ node }) => <PostCard key={node.id} post={node} />)
                    ) : (
                        <p>No posts available under this tech type.</p>
                    )}
                </section>

                <Pagination pageContext={pageContext} />
            </div>
        </Layout>
    );
};

Portfolio.propTypes = {
    location: PropTypes.shape({
        pathname: PropTypes.string.isRequired,
    }).isRequired,
    pageContext: PropTypes.object,
};

export default Portfolio;
