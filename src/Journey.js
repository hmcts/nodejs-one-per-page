const sessions = require('./services/sessions');
const urlParse = require('url-parse');

const parseUrl = baseUrl => {
  if (typeof baseUrl === 'undefined') {
    throw new Error('Must provide a baseUrl');
  }
  return urlParse(baseUrl);
};

const journey = (app, { baseUrl, steps = [], session = {} } = {}) => {
  if (typeof session === 'function') {
    app.use(session);
  } else {
    const cookie = Object.assign(
      { domain: parseUrl(baseUrl).hostname },
      session.cookie || {}
    );
    const sessionOptions = Object.assign({}, session, { cookie });
    app.use(sessions(sessionOptions));
  }
  steps.forEach(step => {
    app.use(step.router);
  });
  return app;
};

module.exports = journey;
