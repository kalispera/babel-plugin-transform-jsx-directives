export default function errorMatching(str) {
  return {
    asymmetricMatch(actual) {
      expect(actual.constructor.name).toBe('Error');
      expect(actual.message).toEqual(expect.stringMatching(str));
      return true;
    },
  };
}
