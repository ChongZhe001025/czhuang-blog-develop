import * as React from "react";
import PropTypes from "prop-types";
import { Link } from "gatsby";
import siteData from "../data/site.json";
import { useLanguage } from "../i18n/LanguageContext";

const Navigation = ({ navClass }) => {
    const navItems = siteData.layoutSettings.edges[0].node.navigation;
    const { t } = useLanguage();

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
                            {t(navItem.label)}
                        </a>
                    );
                } else {
                    return (
                        <Link className={navClass} to={navItem.url} key={i}>
                            {t(navItem.label)}
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
