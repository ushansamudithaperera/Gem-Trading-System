import { Request, Response } from 'express';
import { Gem, GemStatus } from '../models/Gem.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

// ────────────────────────────────────────────────────────
// CREATE: Create a new gem listing (SELLER or CUTTER)
// ────────────────────────────────────────────────────────
export const createGem = asyncHandler(async (req: Request, res: Response) => {
  const { title, description, type, weightCarats, price, location, certificate } = req.body;
  let { images } = req.body;
  
  // Handle uploaded files
  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    images = req.files.map(file => `/uploads/${file.filename}`);
  }

  // Ensure userId from JWT is saved as sellerId
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

// ────────────────────────────────────────────────────────
// READ: Get marketplace (public, filtered gems)
// ────────────────────────────────────────────────────────
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

// ────────────────────────────────────────────────────────
// READ: Get single gem by ID
// ────────────────────────────────────────────────────────
export const getGemById = asyncHandler(async (req: Request, res: Response) => {
  const gem = await Gem.findById(req.params.id).populate('sellerId', 'firstName lastName rating businessName');
  if (!gem) throw new ApiError(404, 'Gem not found');
  res.json(new ApiResponse(200, gem, 'Gem details'));
});

// ────────────────────────────────────────────────────────
// READ: Get my inventory (for SELLER or CUTTER)
// Returns only gems owned by the authenticated user
// ────────────────────────────────────────────────────────
export const getMyInventory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const { type, status, page = 1, limit = 20 } = req.query;

  const filter: any = { sellerId: userId };

  if (type) filter.type = type;
  if (status) filter.status = status;

  const gems = await Gem.find(filter)
    .sort({ createdAt: -1 })
    .skip((+page - 1) * +limit)
    .limit(+limit);

  const total = await Gem.countDocuments(filter);

  res.json(
    new ApiResponse(
      200,
      { gems, total, page, limit },
      'My inventory fetched successfully'
    )
  );
});

// ────────────────────────────────────────────────────────
// READ: Get seller gems (alternative endpoint for frontend)
// Returns all gems owned by the authenticated user
// ────────────────────────────────────────────────────────
export const getSellerGems = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  const gems = await Gem.find({ sellerId: userId })
    .sort({ createdAt: -1 });

  res.json(
    new ApiResponse(
      200,
      gems,
      'Seller gems fetched successfully'
    )
  );
});

// ────────────────────────────────────────────────────────
// READ: Get seller stats (for SELLER or CUTTER)
// Returns statistics about the seller's inventory
// ────────────────────────────────────────────────────────
export const getSellerStats = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;

  // Get active listings count
  const activeListings = await Gem.countDocuments({
    sellerId: userId,
    status: GemStatus.AVAILABLE,
  });

  // Get all gems to calculate stats
  const gems = await Gem.find({ sellerId: userId });

  // Calculate total inventory value (sum of all prices)
  const totalValue = gems.reduce((sum, gem) => sum + gem.price, 0);

  // Count sold gems
  const soldCount = gems.filter((gem) => gem.status === GemStatus.SOLD).length;

  // For now, totalOffers and totalViews are mock values
  // In production, you'd track these in separate collections
  const totalOffers = 0; // Track from Bid/Offer model
  const totalViews = 0; // Track from Analytics model

  res.json(
    new ApiResponse(
      200,
      {
        activeListings,
        totalViews,
        totalValue,
        totalOffers,
        soldCount,
        totalListings: gems.length,
      },
      'Seller stats fetched successfully'
    )
  );
});

// ────────────────────────────────────────────────────────
// UPDATE: Update a gem listing (SELLER or CUTTER - must own)
// ────────────────────────────────────────────────────────
export const updateGem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!._id;
  const { title, description, type, weightCarats, images, price, location, certificate, status } = req.body;

  // Find gem and verify ownership
  const gem = await Gem.findById(id);
  if (!gem) throw new ApiError(404, 'Gem not found');

  if (gem.sellerId.toString() !== userId.toString()) {
    throw new ApiError(403, 'You do not have permission to update this gem listing');
  }

  // Update only allowed fields
  gem.title = title ?? gem.title;
  gem.description = description ?? gem.description;
  gem.type = type ?? gem.type;
  gem.weightCarats = weightCarats ?? gem.weightCarats;
  gem.images = images ?? gem.images;
  gem.price = price ?? gem.price;
  gem.location = location ?? gem.location;
  gem.certificate = certificate ?? gem.certificate;
  gem.status = status ?? gem.status;

  await gem.save();

  res.json(new ApiResponse(200, gem, 'Gem listing updated successfully'));
});

// ────────────────────────────────────────────────────────
// DELETE: Delete a gem listing (SELLER or CUTTER - must own)
// ────────────────────────────────────────────────────────
export const deleteGem = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!._id;

  // Find gem and verify ownership
  const gem = await Gem.findById(id);
  if (!gem) throw new ApiError(404, 'Gem not found');

  if (gem.sellerId.toString() !== userId.toString()) {
    throw new ApiError(403, 'You do not have permission to delete this gem listing');
  }

  // Delete the gem
  await Gem.findByIdAndDelete(id);

  res.json(new ApiResponse(200, null, 'Gem listing deleted successfully'));
});