const React = require("react");
const { LanguageProvider } = require("./src/i18n/LanguageContext");

exports.wrapRootElement = ({ element }) =>
    React.createElement(LanguageProvider, null, element);
