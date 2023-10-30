import SessionModel, {SessionDocument} from "../models/session.model";
import {FilterQuery, UpdateQuery} from "mongoose";
import {signJWT, verifyJWT} from "../utils/jwt.utils";
import {get} from 'lodash';
import {findUser} from "./user.service";
import config from "config";

export async function createSession(userId: string, userAgent: string) {
  const session = await SessionModel.create({ user: userId, userAgent });

  return session.toJSON();
}

export async function findSessions(query: FilterQuery<SessionDocument>) {
  return SessionModel.find(query).lean() // lean() returns a plain JS object instead of a Mongoose document (same as toJSON())
}

export async function updateSession(query: FilterQuery<SessionDocument>, update: UpdateQuery<SessionDocument>) {
  return SessionModel.updateOne(query, update);
}

export async function reIssueAccessToken({refreshToken}: {refreshToken: string}) {
  const {decoded} = verifyJWT(refreshToken);

  // Check if the refresh token has expired or if an _id exists in the decoded token i.e. a session exists
  if (!decoded || !get(decoded, 'session')) return false;

  const session = await SessionModel.findById(get(decoded, 'session'));

  if (!session || !session?.valid) return false;

  const user = await findUser({ _id: session.user });

  if (!user) return false;

  return signJWT({
    ...user,
    session: session._id
  }, {
    expiresIn: config.get<string>('accessTtl') // 15 minutes
  });
}