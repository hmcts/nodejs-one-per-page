const { expect, sinon } = require('../util/chai');
const Conditional = require('../../src/flow/conditional');

describe('flow/Conditional', () => {
  describe('#redirect', () => {
    it('calls the redirector if the condition passes', () => {
      const redirector = { redirect: sinon.stub() };
      new Conditional(redirector, () => true).redirect({}, {});
      expect(redirector.redirect).to.be.called;
    });

    it('does not call the redirector if the condition fails', () => {
      const redirector = { redirect: sinon.stub() };
      new Conditional(redirector, () => false).redirect({}, {});
      expect(redirector.redirect).to.not.be.called;
    });
  });

  describe('#step', () => {
    it('passes through to the the redirectors step function', () => {
      const redirector = { step: sinon.stub() };
      const conditional = new Conditional(redirector, () => false);
      expect(conditional.step).to.eql(redirector.step);
    });
  });
});
