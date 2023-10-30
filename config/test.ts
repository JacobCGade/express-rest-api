export default {
  port: 1337,
  dbUri: process.env.DB_URI || 'url',
  saltWorkFactor: 10,
  accessTtl: "15m",
  refreshTtl: "1y",
  publicJWTKey: process.env.PUBLIC_JWT_KEY || 'public',
  privateJWTKey: process.env.PRIVATE_JWT_KEY || 'private',
}