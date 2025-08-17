import * as React from "react";
import PropTypes from "prop-types";
import { Link } from "gatsby";
import data from "../data/blog.json";

const Navigation = ({ navClass }) => {
    const navItems = data.layoutSettings.edges[0].node.navigation;

    return (
        <>
            {navItems.map((navItem, i) => {
                if (navItem.url.match(/^\s?http(s?)/gi)) {
                    return (
                        <a
                            className={navClass}
                            href={navItem.url}
                            key={i}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {navItem.label}
                        </a>
                    );
                } else {
                    return (
                        <Link className={navClass} to={navItem.url} key={i}>
                            {navItem.label}
                        </Link>
                    );
                }
            })}
        </>
    );
};

Navigation.defaultProps = {
    navClass: `site-nav-item`,
};

Navigation.propTypes = {
    navClass: PropTypes.string,
};

export default Navigation;
