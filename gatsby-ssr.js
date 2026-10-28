const React = require("react");
const { LanguageProvider } = require("./src/i18n/LanguageContext");

exports.wrapPageElement = ({ element, props }) =>
    React.createElement(LanguageProvider, { initialLanguage: props.pageContext?.language }, element);
