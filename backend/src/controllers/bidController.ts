import { Request, Response } from 'express';
import { Bid } from '../models/Bid';
import { Gemstone } from '../models/Gemstone';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const createBid = asyncHandler(async (req: Request, res: Response) => {
  const { gemId, offeredPrice } = req.body;
  const buyerId = req.user!._id;

  const gem = await Gemstone.findById(gemId);
  if (!gem) {
    throw new ApiError(404, 'Gemstone not found');
  }

  if (gem.status === 'Sold') {
    throw new ApiError(400, 'This gemstone has already been sold');
  }

  if (gem.seller.toString() === buyerId.toString()) {
    throw new ApiError(400, 'Sellers cannot bid on their own gemstones');
  }

  const bid = await Bid.create({
    gem: gemId,
    buyer: buyerId,
    seller: gem.seller,
    offeredPrice,
    status: 'Pending',
  });

  res.status(201).json(new ApiResponse(201, bid, 'Bid placed successfully'));
});

export const getBuyerBids = asyncHandler(async (req: Request, res: Response) => {
  const buyerId = req.user!._id;

  const bids = await Bid.find({ buyer: buyerId })
    .populate('gem')
    .populate('seller', 'firstName lastName businessName rating')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, bids, 'Placed bids retrieved successfully'));
});

export const getSellerBids = asyncHandler(async (req: Request, res: Response) => {
  const sellerId = req.user!._id;

  const bids = await Bid.find({ seller: sellerId })
    .populate('gem')
    .populate('buyer', 'firstName lastName rating')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, bids, 'Received bids retrieved successfully'));
});

export const updateBidStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // 'Accepted', 'Rejected', or 'Cancelled'
  const userId = req.user!._id;

  const bid = await Bid.findById(id);
  if (!bid) {
    throw new ApiError(404, 'Bid not found');
  }

  if (bid.status !== 'Pending') {
    throw new ApiError(400, `Cannot update a bid that is already ${bid.status.toLowerCase()}`);
  }

  if (status === 'Cancelled') {
    // Only the buyer can cancel their own bid
    if (bid.buyer.toString() !== userId.toString()) {
      throw new ApiError(403, 'You do not have permission to cancel this bid');
    }
    bid.status = 'Cancelled';
  } else if (status === 'Accepted' || status === 'Rejected') {
    // Only the seller can accept or reject a bid
    if (bid.seller.toString() !== userId.toString()) {
      throw new ApiError(403, 'You do not have permission to accept or reject this bid');
    }
    bid.status = status;

    if (status === 'Accepted') {
      // Update the gemstone status to 'Sold'
      await Gemstone.findByIdAndUpdate(bid.gem, { status: 'Sold' });
      
      // Automatically reject other pending bids for this gemstone
      await Bid.updateMany(
        { gem: bid.gem, _id: { $ne: bid._id }, status: 'Pending' },
        { status: 'Rejected' }
      );
    }
  } else {
    throw new ApiError(400, 'Invalid status update action');
  }

  await bid.save();

  res.status(200).json(new ApiResponse(200, bid, `Bid successfully ${status.toLowerCase()}`));
});
