import * as urlService from '../services/urlService.js';
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

function isValidUrl(urlString) {
  try {
    const url = new URL(urlString);
    if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
      return false;
    };

    if (!url.hostname || url.hostname.length === 0) {
      return false;
    };

    if (process.env.NODE_ENV === 'production') {
      const hostname = url.hostname.toLowerCase();
      if (hostname === 'localhost' || 
          hostname === '127.0.0.1' || 
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.')) {
        return false;
      }
    }
    
    return true;
  } catch (err) {
    return false;
  }
};

function sanitizeUrl(urlString) {
  try {
    const url = new URL(urlString);
    url.hash = '';
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'];
    trackingParams.forEach(param => url.searchParams.delete(param));
    
    return url.toString();
  } catch {
    return urlString;
  }
};

async function shorten(req, res) {
  try {
    let { originalUrl } = req.body;
    
    if (!originalUrl) {
      return res.status(400).json({ error: 'originalUrl is required' });
    }

    originalUrl = originalUrl.trim();
    if (!originalUrl.match(/^[a-zA-Z]+:\/\//)) {
      originalUrl = 'https://' + originalUrl;
    }

    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({ 
        error: 'Invalid URL format',
        message: 'URL must be a valid http:// or https:// URL'
      });
    }

    const sanitizedUrl = sanitizeUrl(originalUrl);
    
    const url = await urlService.createShortUrl(sanitizedUrl);
    const shortUrl = `${req.protocol}://${req.get('host')}/${url.shortCode}`;
    
    res.status(201).json({ 
      shortUrl,
      shortCode: url.shortCode,
      originalUrl: url.originalUrl 
    });
  } catch (error) {
    console.error('Error in shorten:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function redirect(req, res) {
  try {
    const { shortCode } = req.params;
    const referrer = req.get('Referrer') || req.get('Referer') || null;
    
    const originalUrl = await urlService.getOriginalUrl(shortCode, referrer);
    
    if (!originalUrl) {
      return res.status(404).json({ error: 'Short URL not found' });
    }
    
    res.redirect(302, originalUrl);
  } catch (error) {
    console.error('Error in redirect:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

async function analytics(req, res) {
  try {
    const { shortCode } = req.params;
    if (!shortCode || shortCode.length < 3) {
      return res.status(400).json({ error: 'Invalid short code format' });
    }
    
    const stats = await urlService.getAnalytics(shortCode);
    
    if (!stats) {
      return res.status(404).json({ error: 'Short URL not found' });
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Error in analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export { shorten, redirect, analytics };