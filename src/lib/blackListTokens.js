import redis from 'redis';

const redisClient = redis.createClient();

export const addToBlackList = async (token) => await redisClient.LPUSH('token', token);

const CheckBlackList = () => async (req, res, next) => {
    const token = req.cookies.jwt;
    await redisClient.lrange('token', 0, 99999999, (err, data) => {
        if (data.indexOf(token) > -1) {
            return res.status(400).json({
                status: 400,
                error: 'Invalid Token'
            })
        }
        return next();
    });

}
export const checkBlackList = CheckBlackList()

redisClient.on('connect', () => {
    console.log('Redis client connected')
});
redisClient.on('error', (error) => {
    console.log('Redis not connected', error)
});