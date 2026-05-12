import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../../src/app';
import { User } from '../../../src/models/User.model';
import { Gem, GemStatus, GemType } from '../../../src/models/Gem.model';
import { generateToken } from '../../../src/utils/generateToken';

describe('Gem API Integration Tests', () => {
  let sellerToken: string;
  let sellerId: string;
  let buyerToken: string;
  let testGemId: string;

  beforeAll(async () => {
    // Connect to test database (should be set in .env.test)
    await mongoose.connect(process.env.MONGODB_URI_TEST!);
    
    // Create test seller
    const seller = await User.create({
      email: 'seller@test.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'Seller',
      roles: ['SELLER'],
    });
    sellerId = seller._id.toString();
    sellerToken = generateToken(sellerId);
    
    // Create test buyer
    const buyer = await User.create({
      email: 'buyer@test.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'Buyer',
      roles: ['BUYER'],
    });
    buyerToken = generateToken(buyer._id.toString());
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Gem.deleteMany({});
    await mongoose.disconnect();
  });

  describe('POST /api/v1/gems', () => {
    it('should create a new gem listing (seller only)', async () => {
      const gemData = {
        title: 'Blue Sapphire Rough',
        description: 'High quality rough sapphire',
        type: GemType.ROUGH,
        weightCarats: 5.2,
        images: ['https://example.com/photo1.jpg'],
        price: 1200,
        location: 'Ratnapura',
      };

      const response = await request(app)
        .post('/api/v1/gems')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send(gemData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.title).toBe(gemData.title);
      expect(response.body.data.status).toBe(GemStatus.AVAILABLE);
      
      testGemId = response.body.data._id;
    });

    it('should not allow buyer to create gem listing', async () => {
      const gemData = {
        title: 'Test Gem',
        description: 'Should fail',
        type: GemType.POLISHED,
        weightCarats: 1.0,
        images: ['https://example.com/test.jpg'],
        price: 100,
        location: 'Colombo',
      };

      const response = await request(app)
        .post('/api/v1/gems')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send(gemData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Access denied');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .post('/api/v1/gems')
        .send({ title: 'No Auth' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/gems/marketplace', () => {
    it('should return marketplace listings', async () => {
      const response = await request(app)
        .get('/api/v1/gems/marketplace')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('gems');
      expect(Array.isArray(response.body.data.gems)).toBe(true);
      expect(response.body.data).toHaveProperty('total');
    });

    it('should filter by type', async () => {
      const response = await request(app)
        .get('/api/v1/gems/marketplace?type=ROUGH')
        .expect(200);

      expect(response.body.data.gems.every((g: any) => g.type === 'ROUGH')).toBe(true);
    });

    it('should filter by price range', async () => {
      const response = await request(app)
        .get('/api/v1/gems/marketplace?minPrice=500&maxPrice=1500')
        .expect(200);

      response.body.data.gems.forEach((g: any) => {
        expect(g.price).toBeGreaterThanOrEqual(500);
        expect(g.price).toBeLessThanOrEqual(1500);
      });
    });
  });

  describe('GET /api/v1/gems/:id', () => {
    it('should return gem details by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/gems/${testGemId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testGemId);
      expect(response.body.data.sellerId).toHaveProperty('firstName');
    });

    it('should return 404 for non-existent gem', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/v1/gems/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});