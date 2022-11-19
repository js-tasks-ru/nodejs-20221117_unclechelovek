function sum(a, b) {
  if (!Number.isFinite(a) || !Number.isFinite(b)) throw new TypeError;
  return a + b;
}

module.exports = sum;
