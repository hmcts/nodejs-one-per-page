const { isObject, hasKeys } = require('../util/checks');

class Validator {
  constructor(target, message, predicate) {
    this.target = target;
    this.message = message;
    this.predicate = predicate;
  }
}

const validator = (...args) => new Validator(...args);


const errorFor = (id, message) => {
  return { id, message };
};

const parseErrorTarget = (targetOrMessage, fallbackId) => {
  if (isObject(targetOrMessage) && hasKeys(targetOrMessage, 'message', 'id')) {
    return targetOrMessage;
  }
  return errorFor(fallbackId, targetOrMessage);
};


module.exports = { validator, Validator, errorFor, parseErrorTarget };
