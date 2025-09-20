require('dotenv').config();
module.exports = {
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
    SESSION_SECRET: process.env.SESSION_SECRET || 'your_session_secret',
    MONGO_URI: process.env.MONGO_URI ,
    NODE_ENV: process.env.NODE_ENV || 'development',
};
