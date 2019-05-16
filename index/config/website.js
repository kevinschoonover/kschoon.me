const tailwind = require("../tailwind");

module.exports = {
  pathPrefix: "/", // Prefix for all links. If you deploy your site to example.com/portfolio your pathPrefix should be "/portfolio"

  siteTitle: "kschoon.me", // Navigation and Site Title
  siteTitleAlt: "kschoon.me", // Alternative Site title for SEO
  siteTitleShort: "kschoon.me", // short_name for manifest
  siteHeadline: "The Home of Kevin Schoonover", // Headline for schema.org JSONLD
  siteUrl: "https://kschoon.me", // Domain of your site. No trailing slash!
  siteLanguage: "en", // Language Tag on <html> element
  siteLogo: "/logo.png", // Used for SEO and manifest
  siteDescription: "Kevin Schoonover's primary portfolio site.",
  author: "LekoArts", // Author for schema.org JSONLD

  // siteFBAppID: '123456789', // Facebook App ID - Optional
  // userTwitter: '@cara', // Twitter Username
  // ogSiteName: 'cara', // Facebook Site Name
  // ogLanguage: 'en_US', // Facebook Language
  // googleAnalyticsID: 'UA-47519312-5',

  // Manifest and Progress color
  themeColor: tailwind.colors.orange,
  backgroundColor: tailwind.colors.blue
};
