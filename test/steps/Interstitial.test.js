const Interstitial = require('../../src/steps/Interstitial');
const { testStep } = require('../util/supertest');
const { redirectTo } = require('../../src/flow');

describe('Interstitial', () => {
  const MyInterstitial = class extends Interstitial {
    get template() {
      return 'interstitial_views/Interstitial';
    }
    next() {
      return redirectTo({ path: '/next-step' });
    }
  };

  describe('GET', () => {
    it('renders the page', () => {
      return testStep(MyInterstitial)
        .withSetup(req => req.session.generate())
        .get()
        .expect(200);
    });
  });

  describe('POST', () => {
    it('redirects to the next step', () => {
      return testStep(MyInterstitial)
        .withSetup(req => req.session.generate())
        .post()
        .expect(302)
        .expect('Location', '/next-step');
    });
  });
});
