import { UAParser } from "ua-parser-js";
const parseUserAgent = (userAgent) => {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();
  return {
    browser: result.browser.name || "Unknown",
    device: result.device.type || "desktop",
  };
};

export default parseUserAgent;
