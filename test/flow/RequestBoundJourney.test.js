/* eslint-disable global-require */
const { expect, sinon } = require('../util/chai');
const BaseStep = require('../../src/steps/BaseStep');
const EntryPoint = require('../../src/steps/EntryPoint');
const Question = require('../../src/steps/Question');
const CheckYourAnswers = require('../../src/steps/check-your-answers/CheckYourAnswers'); // eslint-disable-line max-len
const { goTo, RequestBoundJourney } = require('../../src/flow');
const { text, form } = require('../../src/forms');
const Joi = require('joi');

describe('journey/RequestBoundJourney', () => {
  it('sets itself to req.journey', () => {
    const req = {};
    const res = {}, steps = {}, settings = {};
    const journey = new RequestBoundJourney(req, res, steps, settings);
    expect(req.journey).to.eql(journey);
  });

  describe('#instance', () => {
    const Step = class extends BaseStep {
      handler(/* req, res */) { /* intentionally blank */ }
    };
    const req = {};
    const res = {};
    const steps = { Step };
    const settings = {};

    it('returns an instance of the given step', () => {
      const journey = new RequestBoundJourney(req, res, steps, settings);
      expect(journey.instance('Step')).an.instanceof(Step);
    });

    it('accepts a Step class', () => {
      const journey = new RequestBoundJourney(req, res, steps, settings);
      expect(journey.instance(Step)).an.instanceof(Step);
    });

    it("throws if given a Step that hasn't been registered", () => {
      const UnknownStep = class extends BaseStep {
        handler(/* req, res */) { /* intentionally blank */ }
      };
      const journey = new RequestBoundJourney(req, res, steps, settings);
      const creatingUnknownStep = () => journey.instance(UnknownStep);

      expect(creatingUnknownStep).to.throw(/UnknownStep not registered/);
    });

    it("throws if given an object that isn't a step", () => {
      const journey = new RequestBoundJourney(req, res, steps, settings);
      const arbitraryObj = () => journey.instance({});

      expect(arbitraryObj).to.throw(/is not a step/);
    });
  });

  describe('#walkTree', () => {
    describe('Simple incomplete journey', () => {
      it('stops on the first incomplete step', () => {
        const {
          journey,
          Entry,
          Name
        } = require('./fixtures/incompleteJourney.fixture');

        const names = journey.walkTree().map(s => s.name);
        expect(names).to.eql([Entry.name, Name.name]);
      });
    });

    describe('Simple complete journey', () => {
      const {
        journey,
        Entry,
        Name,
        CheckAnswers
      } = require('./fixtures/completeJourney.fixture');

      it('returns instances of the questions in the order of the flow', () => {
        const names = journey().walkTree().map(s => s.name);

        expect(names).to.eql([Entry.name, Name.name, CheckAnswers.name]);
      });

      it('retrieves and validates any questions', () => {
        const valids = journey().walkTree()
          .filter(step => step instanceof Question)
          .map(step => step.fields.valid);

        expect(valids).to.eql([true, true]);
      });
    });

    describe('loop protection', () => {
      it('protects against infinite loops', () => {
        const journey = require('./fixtures/loopingJourney.fixture.js');

        const tightLoop = () => journey.walkTree();
        expect(tightLoop).to.throw(/possible infinite loop/);
      });

      it('protects against infinite loops', () => {
        const journey = require('./fixtures/longLoopingJourney.fixture.js');

        const looseLoop = () => journey.walkTree();
        expect(looseLoop).to.throw(/possible infinite loop/);
      });
    });

    describe('Branching journey', () => {
      it('skips steps that are not accessed by the flow', () => {
        const {
          journey,
          A,
          Entry,
          Branch,
          CheckAnswers
        } = require('./fixtures/branchingJourney.fixture');

        const names = journey.walkTree().map(s => s.name);
        expect(names).to.eql([
          Entry.name,
          Branch.name,
          A.name,
          CheckAnswers.name
        ]);
      });
    });
  });

  {
    class Entry extends EntryPoint {
      next() {
        return goTo(this.journey.steps.Name);
      }
    }
    class Name extends Question {
      get form() {
        return form({
          notPresent: text.joi(
            'required',
            Joi.string().required())
        });
      }
      next() {
        return goTo(this.journey.steps.CheckAnswers);
      }
    }
    class CheckAnswers extends CheckYourAnswers {}
    const steps = { Entry, Name, CheckAnswers };
    const session = {
      entryPoint: Entry.name,
      Name: {}
    };
    const req = {
      session,
      currentStep: { name: 'CurrentStep', waitFor: sinon.stub() }
    };
    const res = {};
    const next = sinon.stub();
    const journey = new RequestBoundJourney(req, res, steps, {});

    describe('#collectSteps', () => {
      before(() => {
        sinon.spy(journey, 'walkTree');
        journey.collectSteps(req, res, next);
      });

      it('walks the tree', () => {
        expect(journey.walkTree).calledOnce;
      });

      it('sets #visitedSteps to the steps used in the journey', () => {
        const name = journey.instance(Name);
        const entry = journey.instance(Entry);
        expect(journey.visitedSteps).to.eql([entry, name]);
      });

      it('makes the current step to wait for the steps to be ready', () => {
        expect(req.currentStep.waitFor).calledTwice;
      });
    });

    describe('#completeUpTo', () => {
      const someStep = { name: 'SomeStep' };

      it("throws if steps haven't been collected yet", () => {
        const _journey = new RequestBoundJourney(req, res, steps, {});
        expect(() => _journey.completeUpTo(someStep)).to.throw(
          /Must collectSteps before using journey.completeUpTo/
        );
      });

      it('returns true if the given step exists in the visitedSteps', () => {
        const _journey = new RequestBoundJourney(req, res, steps, {});
        _journey.visitedSteps = [someStep];
        expect(_journey.completeUpTo(someStep)).to.be.true;
      });

      it('returns false if the given step exists in the visitedSteps', () => {
        const _journey = new RequestBoundJourney(req, res, steps, {});
        _journey.visitedSteps = [];
        expect(_journey.completeUpTo(someStep)).to.be.false;
      });
    });

    describe('#continueUrl', () => {
      const someStep = { name: 'SomeStep', path: '/some-step' };

      it("throws if steps haven't been collected yet", () => {
        const _journey = new RequestBoundJourney(req, res, steps, {});
        expect(() => _journey.continueUrl()).to.throw(
          /Must collectSteps before using journey.continueUrl/
        );
      });

      it('returns the path of the last step visited', () => {
        const _journey = new RequestBoundJourney(req, res, steps, {});
        _journey.visitedSteps = [someStep];
        expect(_journey.continueUrl()).to.eql(someStep.path);
      });

      it('returns the path of the entry point if no visitedSteps', () => {
        const _journey = new RequestBoundJourney(req, res, steps, {});
        _journey.visitedSteps = [];
        expect(_journey.continueUrl()).to.eql(Entry.path);
      });
    });

    describe('#values', () => {
      it("throws if steps haven't been collected yet", () => {
        const _journey = new RequestBoundJourney(req, res, steps, {});
        expect(() => _journey.values).to.throw(
          /Add this.journey.collectSteps to CurrentStep.middleware/
        );
      });

      it('returns the values for all visited steps', () => {
        const name = journey.instance(Name);
        expect(journey.values).to.eql(name.values());
      });
    });

    describe('#answers', () => {
      it("throws if steps haven't been collected yet", () => {
        const _journey = new RequestBoundJourney(req, res, steps, {});
        expect(() => _journey.answers).to.throw(
          /Add this.journey.collectSteps to CurrentStep.middleware/
        );
      });

      it('returns the answers for all visited steps', () => {
        const name = journey.instance(Name);
        expect(journey.answers).to.eql([name.answers()]);
      });
    });
  }
});
