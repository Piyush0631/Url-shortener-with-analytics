import AppError from "../../utils/appError.js";
import prisma from "../../config/db.js";

const getAnalytics = async (shortCode, skip, limit) => {
  const url = await prisma.url.findUnique({
    where: { shortCode },
  });
  if (!url) {
    throw new AppError("Link not found", 404);
  }

  const records = await prisma.analytics.findMany({
    where: { shortCode },
    orderBy: { timestamp: "desc" },
    skip,
    take: limit,
  });
  const total = await prisma.analytics.count({
    where: { shortCode },
  });

  return {
    records,
    total,
  };
};

const getSummary = async (shortCode) => {
  const analytics = await prisma.analytics.findMany({
    where: { shortCode },
    select: {
      timestamp: true,
      country: true,
      city: true,
      device: true,
      browser: true,
      referrer: true,
    },
  });

  const countBy = (records, field, fallback = "Unknown") => {
    const count = {};
    for (const record of records) {
      const value = record[field] || fallback;
      count[value] = (count[value] || 0) + 1;
    }
    return Object.entries(count)
      .map(([value, clicks]) => ({
        [field]: value,
        clicks,
      }))
      .sort((a, b) => b.clicks - a.clicks);
  };
  const clicksByDate = {};

  for (const item of analytics) {
    const date = item.timestamp.toISOString().slice(0, 10);
    clicksByDate[date] = (clicksByDate[date] || 0) + 1;
  }
  return {
    totalClicks: analytics.length,
    topCountries: countBy(analytics, "country"),
    topCities: countBy(analytics, "city"),
    topDevices: countBy(analytics, "device"),
    topBrowsers: countBy(analytics, "browser"),
    topReferrers: countBy(analytics, "referrer", "Direct"),
    clicksOverTime: Object.entries(clicksByDate).map(([date, clicks]) => ({
      date,
      clicks,
    })),
  };
};
export default {
  getAnalytics,
  getSummary,
};
