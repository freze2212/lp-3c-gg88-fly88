/**
 * Config link theo domain.
 * Key: hostname không có www (www.gg8us.top → gg8us.top).
 * Thêm domain mới: bổ sung 1 dòng trong linksByDomain.
 */
window.SITE_CONFIG = {
  defaultLink: "https://gg8858.com/?id=400665646",

  linksByDomain: {
    "gg8us.top": "https://gg8858.com/?id=400665646",
  },
};

window.getCtaLink = function getCtaLink() {
  var host = (location.hostname || "").toLowerCase().replace(/^www\./, "");
  var map = window.SITE_CONFIG.linksByDomain || {};
  return map[host] || window.SITE_CONFIG.defaultLink;
};

window.REDIRECT_URL = window.getCtaLink();
