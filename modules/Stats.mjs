
function randn_standard_normal_distribution_using_box_muller_transform() {
  // https://stackoverflow.com/questions/25582882/
  // Sample from uniform (0,1) instead of [0,1)
  let u1 = 0; while (u1 === 0) u1 = Math.random();
  let u2 = 0; while (u2 === 0) u2 = Math.random();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

function randn(mean, stdev) {
  // https://stats.stackexchange.com/questions/16334/
  return mean + stdev * randn_standard_normal_distribution_using_box_muller_transform();
}

export { randn }
