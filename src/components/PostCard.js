import * as React from "react";
import PropTypes from "prop-types";
import { Link } from "gatsby";
// import { Tags } from "@tryghost/helpers-gatsby";
// import { readingTime as readingTimeHelper } from "@tryghost/helpers";

const PostCard = ({ post }) => {
    const url = `/${post.slug}/`;
    // const readingTime = readingTimeHelper(post);

    return (
        <Link to={url} className="post-card">
            <div className="post-card-wrapper">
                <header className="post-card-header">
                    {/* {post.feature_image && (
                        <div
                            className="post-card-image"
                            style={{
                                backgroundImage: `url(${post.feature_image})`,
                            }}
                        ></div>
                    )} */}
                    {/* {post.tags && (
                        <div className="post-card-tags">
                            {" "}
                            <Tags
                                post={post}
                                visibility="public"
                                autolink={false}
                            />
                        </div>
                    )} */}
                    {post.featured && <span>Featured</span>}
                    <h2 className="post-card-title">{post.title}</h2>
                </header>
                    <section className="post-card-excerpt">{post.excerpt}</section>
                <footer className="post-card-footer">
                    <div className="post-card-footer-left">
                        {/* <div className="post-card-avatar">
                            {post.tech_type.profile_image ? (
                                <img
                                    className="author-profile-image"
                                    src={post.tech_type.profile_image}
                                    alt={post.tech_type.name}
                                />
                            ) : (
                                <img
                                    className="default-avatar"
                                    src="/images/icons/avatar.svg"
                                    alt={post.tech_type.name}
                                />
                            )}
                        </div> */}
                        <span>
                            {post.note_visible ? post.note_tech_type.name : ""}
                            {post.portfolio_visible ? post.portfolio_tech_type.name : ""}
                        </span>
                    </div>
                    {/* <div className="post-card-footer-right">
                        <div>{readingTime}</div>
                    </div> */}
                </footer>
            </div>
        </Link>
    );
};

PostCard.propTypes = {
    post: PropTypes.shape({
        slug: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        feature_image: PropTypes.string,
        featured: PropTypes.bool,
        // tags: PropTypes.arrayOf(
        //     PropTypes.shape({
        //         name: PropTypes.string,
        //     })
        // ),
        excerpt: PropTypes.string.isRequired,
        tech_type: PropTypes.shape({
            name: PropTypes.string.isRequired,
            profile_image: PropTypes.string,
        }).isRequired,
    }).isRequired,
};

export default PostCard;
