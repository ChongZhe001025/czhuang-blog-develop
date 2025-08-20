import React from "react";
import PropTypes from "prop-types";
import { Link } from "gatsby";

import { Layout } from "../components";

const Index = () => {
	return (
	<Layout isHome={true} bodyClass="home-page">
			<div className="container home-hero">
				<section className="about-wrapper">
					<div className="about-photo-wrap">
						<div className="about-avatar">
							<img className="about-photo" src="/images/profile.jpg" alt="Chongzhe Huang" />
						</div>
						<div className="about-meta">
							<div className="about-hello">Hi, I’m CZ 👋</div>
							<div className="about-tags"> SRE / DevOps / Cloud‑Native </div>
							{/* <div className="about-cta">
								<Link className="btn btn-primary" to="/posts/">Read My Blog</Link>
								<Link className="btn btn-ghost" to="/portfolio/">Portfolio</Link>
							</div> */}
						</div>
					</div>
					<div className="about-text content">
						<p>
							I’m a SRE engineer passionate about building secure, scalable platforms. I turn ideas into shipped products and share what I learn—while actively advancing my skills in AWS.
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