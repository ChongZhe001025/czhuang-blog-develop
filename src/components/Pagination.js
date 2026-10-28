import * as React from "react";
import PropTypes from "prop-types";
import { Link } from "gatsby";
import { localizedPath, useLanguage } from "../i18n/LanguageContext";

const Pagination = ({ pageContext }) => {
    const { previousPagePath, nextPagePath, humanPageNumber, numberOfPages } =
        pageContext;
    const { language, t } = useLanguage();

    return (
        <nav className="pagination" role="navigation">
            <div>
                {previousPagePath && (
                    <Link to={localizedPath(previousPagePath, language)} rel="prev">
                        {t("Previous")}
                    </Link>
                )}
            </div>
            {numberOfPages > 1 && (
                <div className="pagination-location">
                    {t("Page")} {humanPageNumber} {t("of")} {numberOfPages}
                </div>
            )}
            <div>
                {nextPagePath && (
                    <Link to={localizedPath(nextPagePath, language)} rel="next">
                        {t("Next")}
                    </Link>
                )}
            </div>
        </nav>
    );
};

Pagination.propTypes = {
    pageContext: PropTypes.object.isRequired,
};

export default Pagination;
