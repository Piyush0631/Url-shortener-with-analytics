import prisma from "../../config/db.js";
import AppError from "../../utils/appError.js";
import encodeBase62 from "../../utils/encodeBase62.js";

const createShortUrl = async (longUrl, ownerId) => {
  const OFFSET = 916132832 + 2176782336;
  const url = await prisma.$transaction(async (tx) => {
    const createdUrl = await tx.url.create({
      data: {
        longUrl,
        ownerId,
      },
    });
    const shortCode = encodeBase62(createdUrl.id + OFFSET);
    return tx.url.update({
      where: { id: createdUrl.id },
      data: { shortCode },
    });
  });
  return url;
};
const getLinks = async (ownerId, skip, limit, sort, search) => {
  const links = await prisma.url.findMany({
    where: {
      ownerId,
      longUrl: {
        contains: search,
      },
    },
    skip,
    take: limit,
    orderBy: { createdAt: sort },
  });
  return links;
};
const getLinkByShortCode = async (shortCode, ownerId) => {
  const link = await prisma.url.findFirst({
    where: { shortCode, ownerId },
  });
  return link;
};
const deleteLinkByShortCode = async (shortCode, ownerId) => {
  await prisma.url.delete({
    where: { shortCode, ownerId },
  });
};
export default {
  createShortUrl,
  getLinks,
  getLinkByShortCode,
  deleteLinkByShortCode,
};
