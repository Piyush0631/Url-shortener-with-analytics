import catchAsync from "../../utils/catchAsync.js";
import redirectService from "./redirectService.js";
import parseUserAgent from "../../utils/userAgentParser.js";

const redirect = catchAsync(async (req, res) => {
  const { shortCode } = req.params;
  const userAgent = req.headers["user-agent"];
  const { browser, device } = parseUserAgent(userAgent);

  const longUrl = await redirectService({
    shortCode,
    ip: req.ip,
    device,
    browser,
    userAgent,
    referrer: req.headers.referer,
  });

  res.redirect(302, longUrl);
});

export default redirect;
