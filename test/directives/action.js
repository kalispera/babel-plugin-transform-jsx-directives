export const name = 'action';
export const type = 'attribute';
export const priority = -100;
export function render({ Elm, props, next }) {
  return next(Elm, props);
}
