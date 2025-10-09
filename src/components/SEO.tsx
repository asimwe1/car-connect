import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

interface SEOProps {
  title: string;
  description?: string;
  canonicalPath?: string;
}

const BASE_URL = "https://carhub-rw.vercel.app";

const SEO: React.FC<SEOProps> = ({ title, description, canonicalPath }) => {
  const location = useLocation();
  const canonical = canonicalPath ?? location.pathname + location.search;
  const url = `${BASE_URL}${canonical}`;

  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      {description && <meta name="twitter:description" content={description} />}
    </Helmet>
  );
};

export default SEO;


