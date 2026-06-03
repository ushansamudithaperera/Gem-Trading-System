import { Request, Response } from 'express';
import { Gemstone } from '../models/Gemstone';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const createGem = asyncHandler(async (req: Request, res: Response) => {
  const {
    title,
    price,
    weight,
    gemType,
    shape,
    color,
    clarity,
    treatment,
    lab,
    reportNumber,
    description,
    images,
  } = req.body;

  const gem = await Gemstone.create({
    title,
    price,
    weight,
    gemType,
    shape,
    color,
    clarity,
    treatment,
    lab,
    reportNumber,
    description,
    images: images || [],
    seller: req.user!._id,
    status: 'Active',
  });

  res.status(201).json(new ApiResponse(201, gem, 'Gemstone created successfully'));
});

export const getAllGems = asyncHandler(async (req: Request, res: Response) => {
  const {
    gemType,
    status = 'Active',
    minPrice,
    maxPrice,
    minWeight,
    maxWeight,
    shape,
    color,
    page = 1,
    limit = 20,
  } = req.query;

  const query: any = {};

  if (status) query.status = status;
  if (gemType) query.gemType = gemType;
  if (shape) query.shape = { $regex: String(shape), $options: 'i' };
  if (color) query.color = { $regex: String(color), $options: 'i' };

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (minWeight || maxWeight) {
    query.weight = {};
    if (minWeight) query.weight.$gte = Number(minWeight);
    if (maxWeight) query.weight.$lte = Number(maxWeight);
  }

  const skip = (Number(page) - 1) * Number(limit);

  const gems = await Gemstone.find(query)
    .populate('seller', 'firstName lastName businessName rating')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await Gemstone.countDocuments(query);

  res.status(200).json(
    new ApiResponse(
      200,
      { gems, total, page: Number(page), limit: Number(limit) },
      'Gemstones retrieved successfully'
    )
  );
});

export const getGemById = asyncHandler(async (req: Request, res: Response) => {
  const gem = await Gemstone.findById(req.params.id)
    .populate('seller', 'firstName lastName businessName rating');

  if (!gem) {
    throw new ApiError(404, 'Gemstone not found');
  }

  res.status(200).json(new ApiResponse(200, gem, 'Gemstone retrieved successfully'));
});
