const { expect } = require('../util/chai');
const { field } = require('../../src/forms/field');
const {
  arrayParser,
  textParser,
  nonEmptyTextParser
} = require('../../src/forms/fieldParsers');

describe('forms/fieldParsers', () => {
  const tests = [
    {
      parser: arrayParser,
      name: 'arrayParser',
      parse: [
        { to: [] },
        { to: ['value'], from: 'value' },
        { to: ['value1', 'value2'], from: ['value1', 'value2'] },
        { to: [1], from: 1 }
      ],
      deserialize: [
        { to: [] },
        { to: ['value1', 'value2'], from: ['value1', 'value2'] }
      ]
    }, {
      parser: nonEmptyTextParser,
      name: 'nonEmptyTextParser',
      parse: [
        { to: '' },
        { to: 'value', from: 'value' },
        { to: '1', from: 1 }
      ],
      deserialize: [
        { to: '' },
        { to: 'value', from: 'value' }
      ]
    }, {
      parser: textParser,
      name: 'textParser',
      parse: [
        { to: undefined },
        { to: 'value', from: 'value' },
        { to: '1', from: 1 }
      ],
      deserialize: [
        { to: undefined },
        { to: 'value', from: 'value' }
      ]
    }
  ];

  tests.forEach(({ parser, name, parse, deserialize }) => {
    describe(`#field([name], ${name})`, () => {
      parse.forEach(({ to, from = 'field missing' }) => {
        it(`parses ${from} to ${to}`, () => {
          const f = field('foo', parser);
          if (from === 'field missing') {
            f.parse({ body: {} });
          } else {
            f.parse({ body: { foo: from } });
          }
          expect(f.value).to.eql(to);
        });
      });

      deserialize.forEach(({ to, from = 'field missing' }) => {
        it(`deserializes ${from} to ${to}`, () => {
          const f = field('foo', parser);
          if (from === 'field missing') {
            f.deserialize({ session: {} });
          } else {
            f.deserialize({ session: { foo: from } });
          }
          expect(f.value).to.eql(to);
        });
      });
    });
  });
});