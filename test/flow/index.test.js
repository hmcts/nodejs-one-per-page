const { expect, sinon } = require('../util/chai');
const { goTo, branch } = require('../../src/flow');
const Branch = require('../../src/flow/branch');
const Redirector = require('../../src/flow/redirector');
const Conditional = require('../../src/flow/conditional');

describe('flow', () => {
  describe('#goTo', () => {
    it('returns a Redirector with a redirect method', () => {
      const fakeStep = { path: '/foo' };
      expect(goTo(fakeStep)).to.be.an.instanceof(Redirector);
      expect(goTo(fakeStep).redirect).to.be.a('function');
    });
  });

  describe('#branch', () => {
    it('returns a Branch with a redirect method', () => {
      const fakeRedirector = { redirect: sinon.stub() };
      const conditional = new Conditional(fakeRedirector, () => true);
      const b = branch(conditional, fakeRedirector);

      expect(b).to.be.an.instanceof(Branch);
      expect(b.redirect).to.be.a('function');
    });
  });
});
