import React from "react";
import { Helmet } from "react-helmet-async";
import PropTypes from "prop-types";

const MetaTag = ({
  title,
  description,
  keyword,
  focusKeywords,
  robots,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  ogType,
}) => {
  return (
    <Helmet>
      <meta charSet="utf-8" />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keyword} />
      <meta name="focus-keywords" content={focusKeywords} />
      <meta name="robots" content={robots} />
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:type" content={ogType} />
      {canonical && <meta property="og:url" content={canonical} />}
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle || title} />
      <meta name="twitter:description" content={ogDescription || description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
};

// PropTypes
MetaTag.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  keyword: PropTypes.string.isRequired,
  focusKeywords: PropTypes.string,
  robots: PropTypes.string,
  canonical: PropTypes.string,
  ogTitle: PropTypes.string,
  ogDescription: PropTypes.string,
  ogImage: PropTypes.string,
  ogType: PropTypes.string,
};

// Default values
MetaTag.defaultProps = {
  focusKeywords: "",
  robots: "index, follow",
  canonical: "",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  ogType: "website",
};

export default MetaTag;
