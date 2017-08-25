import * as babel from 'babel-core';
import plugin from '../src/index';
import { reset } from '../src/getDirectives';
import { render } from './directives/action';

function transform(code, options = {}, presets = []) {
  return babel.transform(code, {
    presets,
    plugins: [[plugin(babel), options]],
  }).code.replace(new RegExp(process.cwd(), 'g'), '.');
}

/* sanity check */
describe('action directive', () => {
  it('has a no-op render', () => {
    const Elm = Symbol('Elm');
    const props = Symbol('props');
    const ret = Symbol('return');
    const next = jest.fn(() => ret);

    expect(render({ Elm, props, next })).toBe(ret);
    expect(next).toHaveBeenCalledWith(Elm, props);
  });
});

describe('babel-plugin-transform-jsx-directives', () => {
  afterEach(() => {
    reset();
  });

  it('understands jsx', () => {
    expect(transform('<foo />')).toMatchSnapshot();
  });

  it('transforms an element directive', () => {
    expect(transform(
      '<html foo="bar">foo</html>',
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
          'test/directives/action.js',
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
          'test/directives/action.js',
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
          'test/directives/html.js',
          'test/directives/action.js',
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
          'test/directives/html.js',
        ],
      }
    );

    expect(code).toMatchSnapshot();
  });
});
