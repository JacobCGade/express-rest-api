import { Request, Response } from "express";
import { validatePassword } from "../service/user.service";
import {createSession, findSessions, updateSession} from "../service/session.service";
import {signJWT} from "../utils/jwt.utils";
import config from "config";

export async function createUserSessionHandler(req: Request, res: Response) {
  // Validate the user's password
  const user = await validatePassword(req.body);

  if (!user) {
    return res.status(404).send("Invalid username or password")
  }

  // Create a session
  const session = await createSession(user._id, req.get("user-agent") || "");

  // Create access token
  const accessToken = signJWT({
    ...user,
    session: session._id
  }, {
    expiresIn: config.get<string>('accessTtl') // 15 minutes
  });

  // Create refresh token
  const refreshToken = signJWT({
    ...user,
    session: session._id
  }, {
    expiresIn: config.get<string>('refreshTtl') // 1 year
  });

  // Return access token and refresh token
  return res.send({accessToken, refreshToken})
}

export async function getUserSessionHandler(req: Request, res: Response) {
  const userId = res.locals.user._id

  const sessions = await findSessions({ user: userId, valid: true });

  return res.send(sessions);
}

export async function deleteSessionHandler(req: Request, res: Response) {
  const sessionId = res.locals.user.session; // safe to access since requireUser middleware is used

  await updateSession({ _id: sessionId }, { valid: false });

  return res.send({
    accessToken: null,
    refreshToken: null
  })
}