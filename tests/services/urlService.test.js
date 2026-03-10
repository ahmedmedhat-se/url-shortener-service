import { jest } from '@jest/globals';

jest.unstable_mockModule('../../models/index.js', () => ({
  Url: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
  Click: {
    create: jest.fn(),
  },
}));

const { Url, Click } = await import('../../models/index.js');
const urlService = await import('../../services/urlService.js');

describe('urlService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createShortUrl should create a URL with a shortCode', async () => {
    const mockUrl = { id: 1, originalUrl: 'https://example.com', shortCode: 'abc123' };
    Url.create.mockResolvedValue(mockUrl);

    const result = await urlService.createShortUrl('https://example.com');
    expect(Url.create).toHaveBeenCalledWith({
      originalUrl: 'https://example.com',
      shortCode: expect.any(String),
    });
    expect(result).toEqual(mockUrl);
  });

  test('getOriginalUrl should return null if not found', async () => {
    Url.findOne.mockResolvedValue(null);
    const result = await urlService.getOriginalUrl('nonexistent');
    expect(result).toBeNull();
    expect(Click.create).not.toHaveBeenCalled();
  });

  test('getOriginalUrl should create a click and return originalUrl', async () => {
    const mockUrl = { id: 1, originalUrl: 'https://example.com' };
    Url.findOne.mockResolvedValue(mockUrl);
    Click.create.mockResolvedValue({});

    const result = await urlService.getOriginalUrl('abc123', 'google.com');
    expect(Url.findOne).toHaveBeenCalledWith({ where: { shortCode: 'abc123' } });
    expect(Click.create).toHaveBeenCalledWith({ urlId: 1, referrer: 'google.com' });
    expect(result).toBe('https://example.com');
  });

  test('getAnalytics should return aggregated stats', async () => {
    const mockClicks = [
      { referrer: 'google.com' },
      { referrer: 'google.com' },
      { referrer: null },
      { referrer: 'twitter.com' },
    ];
    const mockUrl = { id: 1, Clicks: mockClicks };
    Url.findOne.mockResolvedValue(mockUrl);

    const result = await urlService.getAnalytics('abc123');
    expect(result).toEqual({
      totalClicks: 4,
      referrers: {
        'google.com': 2,
        direct: 1,
        'twitter.com': 1,
      },
    });
  });

  test('getAnalytics should return null if URL not found', async () => {
    Url.findOne.mockResolvedValue(null);
    const result = await urlService.getAnalytics('nonexistent');
    expect(result).toBeNull();
  });
});