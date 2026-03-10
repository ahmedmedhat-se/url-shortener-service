import { Url, Click } from '../models/index.js';
import crypto from 'crypto';

function generateShortCode() {
  return crypto.randomBytes(4).toString('hex');
}

async function createShortUrl(originalUrl) {
  const shortCode = generateShortCode();
  const url = await Url.create({ originalUrl, shortCode });
  return url;
}

async function getOriginalUrl(shortCode, referrer = null) {
  const url = await Url.findOne({ where: { shortCode } });
  if (!url) return null;

  await Click.create({ urlId: url.id, referrer });
  return url.originalUrl;
}

async function getAnalytics(shortCode) {
  const url = await Url.findOne({
    where: { shortCode },
    include: [{
      model: Click,
      as: 'Clicks'
    }]
  });
  
  if (!url) return null;

  const totalClicks = url.Clicks.length;
  const referrerCounts = url.Clicks.reduce((acc, click) => {
    const ref = click.referrer || 'direct';
    acc[ref] = (acc[ref] || 0) + 1;
    return acc;
  }, {});

  return { totalClicks, referrers: referrerCounts };
}

export { createShortUrl, getOriginalUrl, getAnalytics };