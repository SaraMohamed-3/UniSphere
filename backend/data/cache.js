const { createClient } = require("redis");

const redisUrl =
  process.env.REDIS_URL ||
  `redis://${process.env.REDIS_HOST || "127.0.0.1"}:${process.env.REDIS_PORT || 6379}`;

let client = null;
let redisAvailable = false;
let connectionAttempted = false;

function initClient() {
  if (client) return client;

  client = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: () => false,
    },
    legacyMode: false,
  });

  // Suppress all error events silently
  client.on("error", () => {
    redisAvailable = false;
  });

  client.on("connect", () => {
    redisAvailable = true;
    console.log("✓ Redis connected");
  });

  return client;
}

async function connect() {
  if (connectionAttempted) {
    return redisAvailable;
  }

  connectionAttempted = true;
  const c = initClient();

  if (c.isOpen) {
    redisAvailable = true;
    return true;
  }

  try {
    await Promise.race([
      c.connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 3000),
      ),
    ]);
    redisAvailable = true;
    return true;
  } catch (err) {
    redisAvailable = false;
    return false;
  }
}

async function getCache(key) {
  try {
    if (!(await connect())) return null;
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    return null;
  }
}

async function setCache(key, value, ttlSeconds = 300) {
  try {
    if (!(await connect())) return;
    await client.set(key, JSON.stringify(value), {
      EX: ttlSeconds,
    });
  } catch (err) {
    // Silently fail
  }
}

async function delCache(key) {
  try {
    if (!(await connect())) return;
    await client.del(key);
  } catch (err) {
    // Silently fail
  }
}

module.exports = {
  getCache,
  setCache,
  delCache,
  isRedisAvailable: () => redisAvailable,
};
