const redis = require('redis');
const client = redis.createClient({
    url: 'redis://127.0.0.1:6379'
});

client.on('error', (err) => console.error('Redis Client Error', err));
client.on('connect', () => console.log('Redis Client Connected'));
client.on('ready', () => console.log('Redis Client Ready'));

// Ensure connection is established before exporting
(async () => {
    try {
        await client.connect();
        console.log('Redis connection established successfully');
    } catch (err) {
        console.error('Failed to connect to Redis:', err);
    }
})();

module.exports = client;
