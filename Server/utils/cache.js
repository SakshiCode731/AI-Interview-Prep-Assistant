const NodeCache = require('node-cache');

// stdTTL = 3600 seconds (1 hour) — company data rarely change hoti hai
// checkperiod = expired keys ko background mein clean karta hai
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });

module.exports = cache;