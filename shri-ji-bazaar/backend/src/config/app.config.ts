export const config = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpires: process.env.JWT_EXPIRES || '7d',
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES || '30d',
  },
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10'),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  uploadMaxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE || '5242880'),
  uploadDir: process.env.UPLOAD_DIR || './uploads',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  wsPort: parseInt(process.env.WS_PORT || '3001'),
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
};
