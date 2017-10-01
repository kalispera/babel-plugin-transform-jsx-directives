import * as babel from 'babel-core';
import plugin from '../src/index';
import errorMatching from './helpers/errorMatching';

jest.mock('conventional-changelog-core');

function transform(code, options = {}, presets = []) {
  return babel.transform(code, {
    presets,
    plugins: [[plugin(babel), options]],
  }).code.replace(new RegExp(process.cwd(), 'g'), '.');
}

describe('babel-plugin-transform-jsx-directives', () => {
  it('understands jsx', () => {
    expect(transform('<foo />')).toMatchSnapshot();
  });

  it('transforms an element directive', () => {
    expect(transform(
      '<html foo="bar">foo</html>',
      {
        directives: [
          {
            name: 'html',
            type: 'element',
            source: './test/directives/html.js',
          },
        ],
      }
    )).toMatchSnapshot();
  });

  it('handles directive paths', () => {
    expect(transform(
      '<html foo="bar">foo</html>',
      {
        directives: [
          'test/directives/html.js',
        ],
      }
    )).toMatchSnapshot();
  });

  it('handles boolean props', () => {
    expect(transform(
      '<html foo>foo</html>',
      {
        directives: [
          'test/directives/html.js',
        ],
      }
    )).toMatchSnapshot();
  });

  it('transforms an atrribute directive', () => {
    expect(transform(
      '<Button action={click} foo={bar}>baz</Button>',
      {
        directives: [
          {
            name: 'action',
            source: './test/directives/action.js',
          },
        ],
      }
    )).toMatchSnapshot();
  });

  it('applies directives in nested elements', () => {
    expect(transform(
      `
      <a action="none">
        <b action="all" />
      </a>
      `,
      {
        directives: [
          {
            name: 'action',
            source: './test/directives/action.js',
          },
        ],
      }
    )).toMatchSnapshot();
  });

  it('applies multiple directives on same element', () => {
    const code = transform(
      `
      <html action={woosa} />
      `,
      {
        directives: [
          {
            name: 'html',
            type: 'element',
            priority: 100,
            source: './test/directives/html.js',
          },
          {
            name: 'action',
            source: './test/directives/action.js',
          },
        ],
      }
    );

    expect(code).toMatchSnapshot();
  });

  it('applies multiple directives loaded from one config', () => {
    const code = transform(
      `
      <html action="test" />
      `,
      {
        directives: [
          './test/directives/multi.js',
        ],
      }
    );

    expect(code).toMatchSnapshot();
  });

  it('converts jsx spread operators to object spread', () => {
    const code = transform(
      `
      <html {...bar} />
      `,
      {
        directives: [
          {
            name: 'html',
            type: 'element',
            source: './test/directives/html.js',
          },
        ],
      }
    );

    expect(code).toMatchSnapshot();
  });

  it('prevents mutation of child options by parent directives', () => {
    const code = transform(
      `
      <html foo="bar" baz="qux" quux />
      `,
      {
        directives: [
          {
            name: 'foo',
            source: './test/directives/foo.js',
            priority: 1,
          },
          {
            name: 'baz',
            source: './test/directives/baz.js',
          },
        ],
      }
    );

    expect(code).toMatchSnapshot();
  });

  it('imports directive module', () => {
    const code = transform('<changelog />', { directives: ['conventional-changelog-core'] });

    expect(code).toMatchSnapshot();
  });

  it('throws when a directive can not be imported', () => {
    expect(() => {
      transform('<foo />', { directives: ['foo-module'] });
    }).toThrow(errorMatching('Cannot find module'));
  });

  it('applies transformOptions', () => {
    const code = transform(
      `
      <div foo="Bar" />
      `,
      {
        directives: [
          {
            name: 'foo',
            transformOptions({ types: t }, node) {
              return t.jSXExpressionContainer(t.objectExpression([
                t.objectProperty(
                  t.identifier('value'),
                  node
                ),
              ]));
            },
            source: 'foo.js',
          },
        ],
      }
    );

    expect(code).toMatchSnapshot();
  });
});
