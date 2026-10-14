"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisIoAdapter = void 0;
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
const redis_1 = require("redis");
const redis_adapter_1 = require("@socket.io/redis-adapter");
class RedisIoAdapter extends platform_socket_io_1.IoAdapter {
    adapterConstructor;
    async connectToRedis() {
        const redisUrl = process.env.REDIS_URL;
        if (!redisUrl) {
            throw new Error('REDIS_URL environment variable is missing');
        }
        const pubClient = (0, redis_1.createClient)({
            url: redisUrl,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 1) {
                        return false;
                    }
                    return 500;
                }
            }
        });
        pubClient.on('error', (err) => {
            console.error('Redis pubClient error:', err.message);
        });
        const subClient = pubClient.duplicate();
        subClient.on('error', (err) => {
            console.error('Redis subClient error:', err.message);
        });
        await Promise.all([pubClient.connect(), subClient.connect()]);
        this.adapterConstructor = (0, redis_adapter_1.createAdapter)(pubClient, subClient);
    }
    createIOServer(port, options) {
        const server = super.createIOServer(port, options);
        server.adapter(this.adapterConstructor);
        return server;
    }
}
exports.RedisIoAdapter = RedisIoAdapter;
//# sourceMappingURL=redis-io.adapter.js.map