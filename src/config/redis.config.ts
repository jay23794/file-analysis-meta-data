import * as dotenv from "dotenv";
import { Redis } from "ioredis";
dotenv.config();

class RedisConnectionConfig {
    
    private static instance: Redis;


    getConnection(): Redis {

        if (!RedisConnectionConfig.instance) {
            RedisConnectionConfig.instance = new Redis({
                host: process.env.host || '127.0.0.1',
                port: Number(process.env.redis_port) || 6379,
                maxRetriesPerRequest: null,
            });


            RedisConnectionConfig.instance.on('connect', () => {
                console.log('✅ Redis connected');
            });


            RedisConnectionConfig.instance.on('error', (err) => {
                console.error('❌ Redis error:', err);
            });
        }


        return RedisConnectionConfig.instance;
    }
}

export const redisConnection = new RedisConnectionConfig();