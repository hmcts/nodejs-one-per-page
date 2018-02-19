const { testStep, shouldNotSetCookie } = require('../util/supertest');
const ExitPoint = require('../../src/steps/ExitPoint');
const Question = require('../../src/steps/Question');
const { expect } = require('../util/chai');
const { OK } = require('http-status-codes');
const { form, field } = require('../../src/forms');
const { goTo } = require('../../src/flow');

describe('steps/ExitPoint', () => {

  describe('GET', () => {
    it('destroys a session if there is one and cookie is not set', () => {
      return testStep(ExitPoint)
        .get()
        .expect(200)
        .expect(shouldNotSetCookie(/session/));
    });

    const ExitStep = class extends ExitPoint {
      static get path() {
        return '/exit-step';
      }
      values() {
        return {
          name: this.journey.getField('firstName', this.journey.steps.Name)
        };
      }
      get template() {
        return 'exit_views/exit';
      }
    };

    const ExitStepWithoutValues = class extends ExitPoint {
      static get path() {
        return '/exit-step';
      }
      get template() {
        return 'exit_views/exit';
      }
    };

    const expectedPath = '/exit-step?name=Enda';

    describe('when theres a session', () => {
      const Name = class extends Question {
        get form() {
          return form(field('firstName'), field('lastName'));
        }
        next() {
          return goTo(this.journey.steps.ExitStep);
        }
      };

      const session = {
        entryPoint: Name.name,
        Name: { firstName: 'Enda', lastName: 'McCormack' }
      };

      const steps = { Name, ExitStep };

      it('adds values to path', () => {
        return testStep(ExitStep)
          .withSession(session)
          .withSetup(req => {
            req.journey.steps = steps;
          })
          .get()
          .expect('Location', expectedPath)
          .expect(302);
      });

      it('destroys sessions if values are in path', () => {
        return testStep(ExitStep)
          .withSession(session)
          .withSetup(req => {
            req.query = { name: 'Enda' };
            req.journey.steps = steps;
          })
          .get()
          .expect(shouldNotSetCookie(/session/));
      });

      it('should not populate query if values is not overridden', () => {
        // will not redirect if no values
        return testStep(ExitStepWithoutValues)
          .withSession(session)
          .withSetup(req => {
            req.journey.steps = { Name, ExitStepWithoutValues };
          })
          .get()
          .expect(200);
      });
    });

    describe('when there is no session', () => {
      it('returns render the endpoint based on the url variables', () => {
        return testStep(ExitStep)
          .get(expectedPath)
          .expect(OK)
          .html($ => {
            return expect($('body')).to.contain.$text('Enda');
          });
      });
    });
  });

  describe('POST', () => {
    it('returns 405 (Method not allowed)', () => {
      return testStep(ExitPoint)
        .post()
        .expect(405);
    });
  });
});
