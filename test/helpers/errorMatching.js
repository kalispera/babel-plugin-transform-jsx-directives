export default function errorMatching(str) {
  return {
    asymmetricMatch(actual) {
      expect(['Error', 'SyntaxError']).toContain(actual.constructor.name);
      expect(actual.message).toEqual(expect.stringMatching(str));
      return true;
    },
  };
}
