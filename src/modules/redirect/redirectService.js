import prisma from "../../config/db.js";
import getLocation from "../../utils/ipGeolocation.js";
import AppError from "../../utils/appError.js";

const redirectService = async ({
  shortCode,
  ip,
  device,
  browser,
  userAgent,
  referrer,
}) => {
  const url = await prisma.url.findUnique({
    where: { shortCode },
  });

  if (!url) {
    throw new AppError("URL not found", 404);
  }
  let location = null;
  try {
    location = await getLocation(ip);
  } catch (err) {
    throw new AppError(`Geolocation lookup failed: ${err.message}`, 500);
  }
  try {
    await prisma.$transaction(async (tx) => {
      await tx.analytics.create({
        data: {
          shortCode,
          country: location?.country ?? null,
          city: location?.city ?? null,
          zip: location?.zip ?? null,
          device,
          browser,
          referrer,
          userAgent,
        },
      });

      await tx.url.update({
        where: { shortCode },
        data: {
          clicks: { increment: 1 },
        },
      });
    });
  } catch (err) {
    throw new AppError(`Click tracking failed: ${err.message}`, 500);
  }

  return url.longUrl;
};

export default redirectService;
