import { jest } from '@jest/globals';
import request from 'supertest';

jest.unstable_mockModule('../../services/urlService.js', () => ({
  createShortUrl: jest.fn(),
  getOriginalUrl: jest.fn(),
  getAnalytics: jest.fn(),
}));

const app = (await import('../../app.js')).default;
const urlService = await import('../../services/urlService.js');

describe('URL Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /shorten should return 400 if originalUrl missing', async () => {
    const res = await request(app).post('/shorten').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('originalUrl is required');
  });

  test('POST /shorten should return 201 with short URL', async () => {
    urlService.createShortUrl.mockResolvedValue({ shortCode: 'abc123' });
    const res = await request(app)
      .post('/shorten')
      .send({ originalUrl: 'https://example.com' });
    expect(res.statusCode).toBe(201);
    expect(res.body.shortUrl).toMatch(/\/abc123$/);
  });

  test('GET /:shortCode should redirect on success', async () => {
    urlService.getOriginalUrl.mockResolvedValue('https://example.com');
    const res = await request(app).get('/abc123');
    expect(res.statusCode).toBe(302);
    expect(res.header.location).toBe('https://example.com');
  });

  test('GET /:shortCode should return 404 if not found', async () => {
    urlService.getOriginalUrl.mockResolvedValue(null);
    const res = await request(app).get('/nonexistent');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Short URL not found');
  });

  test('GET /analytics/:shortCode should return stats', async () => {
    const mockStats = { totalClicks: 5, referrers: { google: 2, direct: 3 } };
    urlService.getAnalytics.mockResolvedValue(mockStats);
    const res = await request(app).get('/analytics/abc123');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(mockStats);
  });

  test('GET /analytics/:shortCode should return 404 if not found', async () => {
    urlService.getAnalytics.mockResolvedValue(null);
    const res = await request(app).get('/analytics/nonexistent');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Short URL not found');
  });
});