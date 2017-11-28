const Redirect = require('./Redirect');
const createSession = require('../session/createSession');
const { continueToNext } = require('../flow');

class EntryPoint extends Redirect {
  get middleware() {
    return [...super.middleware, createSession];
  }

  handler(req, res) {
    req.session.entryPoint = this.name;
    super.handler(req, res);
  }

  get flowControl() {
    return continueToNext(this);
  }
}

module.exports = EntryPoint;
