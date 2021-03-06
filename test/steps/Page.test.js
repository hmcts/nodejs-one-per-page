const Page = require('./../../src/steps/Page');
const { testStep } = require('../util/supertest');
const { OK, METHOD_NOT_ALLOWED } = require('http-status-codes');
const { expect } = require('../util/chai');
const path = require('path');

describe('Page', () => {
  {
    const page = testStep(class extends Page {
      get template() {
        return 'page_views/simplePage';
      }
    });

    it('renders the page on GET', () => {
      return page.get().expect(OK, '<h1>Hello, World!</h1>\n');
    });

    it('returns 405 (method not allowed) on POST', () => {
      return page.post().expect(METHOD_NOT_ALLOWED);
    });
    it('returns 405 (method not allowed) on PUT', () => {
      return page.put().expect(METHOD_NOT_ALLOWED);
    });
    it('returns 405 (method not allowed) on DELETE', () => {
      return page.delete().expect(METHOD_NOT_ALLOWED);
    });
    it('returns 405 (method not allowed) on PATCH', () => {
      return page.patch().expect(METHOD_NOT_ALLOWED);
    });
  }

  const testRoot = path.resolve(__dirname, '../views/Page/content_tests');
  const testDir = fp => path.join(testRoot, fp);
  const schemes = [
    {
      dir: testDir('1'),
      template: '[Step].html',
      content: '[Step].json'
    }, {
      dir: testDir('2'),
      template: '[Step].template.html',
      content: 'content.json'
    }, {
      dir: testDir('3'),
      template: 'template.html',
      content: 'content.en.json'
    }
  ];

  describe('Template rendering', () => {
    schemes.forEach(({ dir, template }) => {
      const page = class ContentTest extends Page {
        get dirname() {
          return dir;
        }
      };

      const request = testStep(page).get();

      it(`renders a template named ${template}`, () => {
        return request.html($ => expect($('h1')).$text('Hello, World!'));
      });
    });

    it('has access to the session', () => {
      const page = class extends Page {
        get template() {
          return 'page_views/session';
        }
      };

      return testStep(page)
        .withSession({ foo: 'Foo', bar: 'Bar' })
        .get()
        .expect(OK, 'Foo Bar\n');
    });

    it('has access to arbitrary functions on the step', () => {
      const page = class extends Page {
        get template() {
          return 'page_views/class_locals';
        }
        get foo() {
          return this.scopedFoo();
        }
        scopedFoo() {
          return 'Foo';
        }
        get bar() {
          return 'Bar';
        }
      };

      return testStep(page)
        .get()
        .expect(OK, 'Foo Bar\n');
    });
  });

  describe('Content rendering', () => {
    schemes.forEach(({ dir, content }) => {
      const page = class ContentTest extends Page {
        get dirname() {
          return dir;
        }
      };

      const request = testStep(page).get();

      it(`renders content from ${content}`, () => {
        return request.html($ => expect($('#singleKey')).$text('Single Key'));
      });
    });

    {
      const page = class ContentTest extends Page {
        get dirname() {
          return testDir('1');
        }
        get foo() {
          return 'Foo';
        }
      };
      const request = testStep(page)
        .withSession({ foo: 'Foo' })
        .get();

      it('supports nested keys', () => {
        return request.html($ => expect($('#nestedKey')).$text('Nested Key'));
      });

      it('has access to arbitrary functions on the step', () => {
        return request.html($ => expect($('#funcKey')).$text('Foo is Foo'));
      });
    }
  });

  it('looks for a template named [Step.name] in views', () => {
    const page = class TestPage extends Page {};
    return testStep(page)
      .get()
      .expect(OK, 'Default Page template\n');
  });
});
