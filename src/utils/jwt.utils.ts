import jwt from 'jsonwebtoken';
import config from 'config';
import {undefined} from "zod";

const privateKey = config.get<string>('privateJWTKey');
const publicKey = config.get<string>('publicJWTKey');

export function signJWT(payload: object, options?: jwt.SignOptions | undefined): string {
  return jwt.sign(payload, privateKey, { ...(options && options), algorithm: 'RS256' });
}

export function verifyJWT(token: string) {
  try {
    const decoded = jwt.verify(token, publicKey);
    return {
      valid: true,
      expired: false,
      decoded
    }
  } catch (err: any) {
    return {
      valid: false,
      expired: err.message === 'jwt expired',
      decoded: null
    }
  }
}