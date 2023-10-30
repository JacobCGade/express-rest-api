import { Request, Response, NextFunction } from 'express';
import { get } from 'lodash';
import { verifyJWT } from '../utils/jwt.utils';
import {reIssueAccessToken} from "../service/session.service";

// Attach the user object to the request if JWT is valid
export const deserializeUser = async (req: Request, res: Response, next: NextFunction) => {
  // Get tokens from headers
  const accessToken = get(req, 'headers.authorization', '').replace(/^Bearer\s/, ''); // Remove Bearer from string
  let refreshToken = get(req, 'headers.x-refresh');

  // If no tokens found, continue on
  if (!accessToken) return next();

  refreshToken = refreshToken?.toString();

  // Verify the access token
  const { decoded, expired } = verifyJWT(accessToken);

  // If valid, attach the decoded JWT to the request object
  if (decoded) {
    res.locals.user = decoded;
    return next();
  }

  // If expired, but has a refresh token, issue a new access token
  if (expired && refreshToken) {
    const newAccessToken = await reIssueAccessToken({ refreshToken });

    if (newAccessToken) {
      res.setHeader('x-access-token', newAccessToken)

      const result = verifyJWT(newAccessToken)

      res.locals.user = result.decoded;
    }
  }

  return next();
}