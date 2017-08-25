import * as babel from 'babel-core';
import plugin from '../src/index';

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
});
