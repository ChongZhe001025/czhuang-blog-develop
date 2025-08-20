import React from "react";
import PropTypes from "prop-types";

import { Layout } from "../components";

const Index = () => {
    return (
        <Layout isHome={true}>
            <div className="container home-hero">
                <section className="about-wrapper">
                    <div className="about-photo-wrap">
                        <img className="about-photo" src="/images/profile.jpg" alt="Chongzhe Huang" />
                    </div>
                    <div className="about-text content">
                        <p>
                            Hello, I’m a software engineer focused on cloud‑native, DevOps, and scalable web apps.
                            I turn ideas into shipped products and share what I learn along the way.
                        </p>
                        <p className="about-byline">— Chongzhe Huang</p>
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
