import catchAsync from "../../utils/catchAsync.js";
import linkService from "./linkService.js";
import AppError from "../../utils/appError.js";
import { shortenSchmea, querySchema } from "./linkValidator.js";

const createShortUrl = catchAsync(async (req, res, next) => {
  const data = shortenSchmea.parse(req.body);
  const ownerId = req.userId;
  const url = await linkService.createShortUrl(data.longUrl, ownerId);
  res.status(201).json({
    success: true,
    data: url,
  });
});

const getLinks = catchAsync(async (req, res, next) => {
  const data = querySchema.parse(req.query);
  const page = data.page || 1;
  const limit = data.limit || 10;
  const sort = data.sort;
  const search = data.search || "";
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const skip = (pageNumber - 1) * limitNumber;
  const ownerId = req.userId;
  const links = await linkService.getLinks(
    ownerId,
    skip,
    limitNumber,
    sort,
    search,
  );
  res.status(200).json({
    success: true,
    data: links,
  });
});

const getLinkByShortCode = catchAsync(async (req, res, next) => {
  const { shortCode } = req.params;
  const ownerId = req.userId;
  const link = await linkService.getLinkByShortCode(shortCode, ownerId);
  res.status(200).json({
    success: true,
    data: link,
  });
});

const deleteLinkByShortCode = catchAsync(async (req, res, next) => {
  const { shortCode } = req.params;
  const ownerId = req.userId;
  const link = await linkService.deleteLinkByShortCode(shortCode, ownerId);
  res.status(200).json({
    success: true,
    message: "Link deleted successfully",
  });
});

export default {
  createShortUrl,
  getLinks,
  getLinkByShortCode,
  deleteLinkByShortCode,
};
