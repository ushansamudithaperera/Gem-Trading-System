import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';

// Converts local file information to a GoogleGenerativeAI.Part object.
const fileToGenerativePart = (filePath: string, mimeType: string) => {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString('base64'),
      mimeType,
    },
  };
};

/**
 * Scan Gemstone Endpoint
 * Accepts a gemstone image, passes it to gemini-1.5-flash with a JSON structured prompt,
 * parses and returns the metadata.
 */
export const scanGem = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload an image file of the gemstone');
  }

  const filePath = req.file.path;
  const mimeType = req.file.mimetype;

  try {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new ApiError(500, 'GEMINI_API_KEY is not configured on the server');
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const imagePart = fileToGenerativePart(filePath, mimeType);
    const prompt = "Analyze this gemstone image. Return ONLY a valid JSON object with these keys: 'title' (a short descriptive name), 'gemType' (e.g., 'Rough' or 'Faceted'), 'color', 'shape' (e.g., 'Oval', 'Cushion', 'Uncut'), 'clarity' (guess if possible, otherwise 'Unknown'). Do not include markdown formatting or backticks.";

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Clean markdown styling if Gemini outputs standard markdown code block backticks
    const cleanedText = text.replace(/```json\s?|```/g, '').trim();

    let parsedJson;
    try {
      parsedJson = JSON.parse(cleanedText);
    } catch (parseError) {
      logger.error('Failed to parse Gemini JSON response:', text);
      throw new ApiError(500, 'Failed to parse AI response as valid gemstone data');
    }

    res.json(new ApiResponse(200, parsedJson, 'Gemstone scanned successfully'));
  } finally {
    // Clean up local temp file
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        logger.error(`Failed to delete temporary file: ${filePath}`, err);
      }
    }
  }
});

/**
 * Dispute Arbiter Endpoint
 * Accepts dispute chat logs and descriptions, passes it to gemini-1.5-flash,
 * and returns an impartial plain text verdict.
 */
export const analyzeDispute = asyncHandler(async (req: Request, res: Response) => {
  const { chatLogs, disputeDescription } = req.body;

  if (!chatLogs || !Array.isArray(chatLogs)) {
    throw new ApiError(400, 'chatLogs must be an array of messages');
  }
  if (!disputeDescription || typeof disputeDescription !== 'string') {
    throw new ApiError(400, 'disputeDescription must be a string');
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new ApiError(500, 'GEMINI_API_KEY is not configured on the server');
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Format message array to a readable transcript format
  const formattedChatLogs = chatLogs
    .map((msg: any) => {
      const role = msg.senderRole || msg.sender || 'Unknown';
      const text = msg.message || msg.text || '';
      return `${role}: ${text}`;
    })
    .join('\n');

  const prompt = `You are an impartial B2B GemTrade Dispute Arbiter. Read these logs and description. Provide a brief 3-sentence summary of the issue, and clearly state who is likely at fault (Buyer or Seller) based on standard marketplace rules. Return the response as plain text.

Dispute Description:
${disputeDescription}

Chat Logs:
${formattedChatLogs}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const verdictText = response.text().trim();

  res.json(
    new ApiResponse(
      200,
      { verdict: verdictText },
      'Dispute analyzed successfully'
    )
  );
});
