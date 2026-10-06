import prisma from "../../config/db.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/appError.js";

export const authorizeLinkOwner = catchAsync(async (req, res, next) => {
  const { shortCode } = req.params;
  const userId = req.userId;
  const link = await prisma.url.findUnique({
    where: { shortCode },
  });
  if (!link) {
    return next(new AppError("Link not found", 404));
  }
  if (link.ownerId !== userId) {
    return next(
      new AppError("You are not authorized to access this link", 403),
    );
  }
  req.link = link;
  next();
});
