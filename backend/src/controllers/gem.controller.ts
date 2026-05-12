import { Request, Response } from 'express';
import { Gem, GemStatus } from '../models/Gem.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const createGem = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, type, weightCarats, images, price, location, certificate } = req.body;
  const gem = await Gem.create({
    sellerId: req.user!._id,
    title,
    description,
    type,
    weightCarats,
    images,
    price,
    location,
    certificate,
    status: GemStatus.AVAILABLE,
  });
  res.status(201).json(new ApiResponse(201, gem, 'Gem listed for sale'));
});

export const getMarketplace = asyncHandler(async (req: Request, res: Response) => {
  const { type, minPrice, maxPrice, minWeight, maxWeight, page = 1, limit = 20 } = req.query;
  const filter: any = { status: GemStatus.AVAILABLE };

  if (type) filter.type = type;
  if (minPrice || maxPrice) filter.price = {};
  if (minPrice) filter.price.$gte = +minPrice;
  if (maxPrice) filter.price.$lte = +maxPrice;
  if (minWeight) filter.weightCarats = { $gte: +minWeight };
  if (maxWeight) filter.weightCarats = { $lte: +maxWeight };

  const gems = await Gem.find(filter)
    .populate('sellerId', 'firstName lastName rating')
    .sort({ createdAt: -1 })
    .skip((+page - 1) * +limit)
    .limit(+limit);

  const total = await Gem.countDocuments(filter);
  res.json(new ApiResponse(200, { gems, total, page, limit }, 'Marketplace fetched'));
});

export const getGemById = asyncHandler(async (req: Request, res: Response) => {
  const gem = await Gem.findById(req.params.id).populate('sellerId', 'firstName lastName rating businessName');
  if (!gem) throw new ApiError(404, 'Gem not found');
  res.json(new ApiResponse(200, gem, 'Gem details'));
});