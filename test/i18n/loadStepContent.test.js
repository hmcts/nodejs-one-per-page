const { expect } = require('../util/chai');
const i18Next = require('i18next');
const { loadStepContent } = require('../../src/i18n/loadStepContent');
const path = require('path');

describe('i18n/loadStepContent', () => {
  const tests = [
    'content.json',
    'content.en.json',
    'StepName.json',
    'StepName.en.json',
    'StepName.content.json',
    'StepName.content.en.json',
    'StepName.content.section.json'
  ];

  const testRoot = path.resolve(__dirname, './fixtures/loadStepContent');
  const i18N = i18Next.init();
  i18N.changeLanguage('en');
  const step = {
    dirname: testRoot,
    name: 'StepName'
  };

  tests.forEach(filename => {
    it(`loads content from ${filename}`, () => {
      const key = `StepName:${filename.replace(/\./g, '_dot_')}`;
      return loadStepContent(step, i18N)
        .then(() => expect(i18N.t(key)).to.eql('Expected Value'));
    });
  });

  it('expects [stepname].json to have lang codes as top level keys', () => {
    const currentStep = {
      dirname: path.resolve(__dirname, './fixtures/loadStepContent'),
      name: 'WillThrow'
    };
    const willFail = loadStepContent(currentStep, i18N);
    return expect(willFail).rejectedWith(/not a country code/);
  });
});
