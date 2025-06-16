// Ensures the question is within Hanafi Fiqh
module.exports = function (req, res, next) {
  const { message } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid message format' });
  }

  const blocked = ['shafi', 'maliki', 'hanbali', 'comparison', 'salafi'];
  if (blocked.some(term => message.toLowerCase().includes(term))) {
    return res.status(403).json({
      error: 'This assistant only supports Hanafi jurisprudence. Other schools are outside scope.',
    });
  }

  next();
};
