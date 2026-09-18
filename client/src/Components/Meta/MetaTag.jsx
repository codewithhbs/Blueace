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
}) => {
  return (
    <Helmet>
      <meta charSet="utf-8" />

      <title>{title}</title>

      <meta name="description" content={description} />

      <meta name="keywords" content={keyword} />

      <meta name="focus-keywords" content={focusKeywords} />

      <meta name="robots" content={robots} />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
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
};

// Default values
MetaTag.defaultProps = {
  focusKeywords: "",
  robots: "index, follow",
  canonical: "",
};

export default MetaTag;
