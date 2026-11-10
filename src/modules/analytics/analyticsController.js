import catchAsync from "../../utils/catchAsync.js";
import analyticsService from "./analyticsService.js";
import { analyticsQuerySchema } from "./analyticsValidator.js";
const getAnalytics = catchAsync(async (req, res) => {
  const { shortCode } = req.params;
  const data = analyticsQuerySchema.parse(req.query);
  const page = data.page || 1;
  const limit = data.limit || 10;
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;
  const { records, total } = await analyticsService.getAnalytics(
    shortCode,
    skip,
    limitNumber,
  );
  res.status(200).json({
    status: "success",
    data: {
      records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});
const getSummary = catchAsync(async (req, res) => {
  const { shortCode } = req.params;

  const summary = await analyticsService.getSummary(shortCode);

  res.status(200).json({
    success: true,
    data: summary,
  });
});
export default {
  getAnalytics,
  getSummary,
};
