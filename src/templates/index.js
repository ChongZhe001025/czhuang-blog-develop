import React from "react";
import PropTypes from "prop-types";

import { Layout } from "../components";

const Index = () => {
    return (
        <Layout isHome={true}>
            <div className="container">
                <section className="about-wrapper">
                    <div className="about-text content">
                        <p>"If we don’t invest time in improving ourselves now, we’ll have <br />to spend even more time coping with an unsatisfactory life in the future."</p>
                        <p className="about-byline">— Chongzhe Huang</p>
                    </div>
                    <div className="about-photo-wrap">
                        <img className="about-photo" src="/images/profile.jpg" alt="Chongzhe Huang" />
                    </div>
                </section>
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
