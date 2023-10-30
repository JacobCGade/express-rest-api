// Using the config module installed with npm

export default {
    port: 1337,
    dbUri: process.env.DB_URI,
    saltWorkFactor: 10,
    accessTtl: "15m",
    refreshTtl: "1y",
    publicJWTKey: process.env.PUBLIC_JWT_KEY,
    privateJWTKey: process.env.PRIVATE_JWT_KEY,
}