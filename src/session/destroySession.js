const destroySession = (req, res, next) => {
  if (typeof req.session === 'undefined') {
    throw new Error('Session not initialized');
  }
  req.session.destroy();
  next();
};

module.exports = destroySession;