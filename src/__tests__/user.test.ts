import * as UserService from '../service/user.service';
import * as SessionService from '../service/session.service';
import supertest from "supertest";
import createServer from "../utils/server";
import mongoose from "mongoose";
import {createUserSessionHandler} from "../controller/session.controller";

const app = createServer();

const userInput = {
  email: "test@example.com",
  name: "Jane Doe",
  password: "Password123",
  passwordConfirmation: "Password123"
}
const userId = new mongoose.Types.ObjectId().toString();
const userPayload = {
  _id: userId,
  email: "jane.doe@example.com",
  name: "Jane Doe",
}

const sessionPayload = {
  _id: new mongoose.Types.ObjectId().toString(),
  user: userId,
  valid: true,
  userAgent: "PostmanRuntime/7.33.0",
  createdAt: new Date("2023-10-20T16:42:42.518+00:00"),
  updatedAt: new Date("2023-10-20T16:42:42.518+00:00"),
  __v: 0
}


describe('user', () => {
  // user registration

  describe('user registration', () => {

    // the username and password get validated
    describe('given the username and password are valid', () => {
      it('should return the user payload and a 200 status code', async () => {
        // @ts-ignore
        const createUserServiceSpy = jest.spyOn(UserService, 'createUser').mockReturnValueOnce(userPayload);

        const {statusCode, body} = await supertest(app).post('/api/users').send(userInput);

        expect(statusCode).toBe(200);
        expect(body).toEqual(userPayload);
        
        expect(createUserServiceSpy).toHaveBeenCalledWith(userInput);
      });
    })

    // verify that the passwords match
    describe('given the passwords do not match', () => {
      it('should return a 400 status code', async () => {
        // @ts-ignore
        const createUserServiceSpy = jest.spyOn(UserService, 'createUser').mockReturnValueOnce(userPayload);

        const {statusCode} = await supertest(app).post('/api/users').send({...userInput, passwordConfirmation: 'doesNotMatch456'});

        expect(statusCode).toBe(400);

        expect(createUserServiceSpy).not.toHaveBeenCalled();
      });
    })

    // verify that the handler handles any errors
    describe('given the user service throws an error', () => {
      it('should return a 409 status code', async () => {
        // @ts-ignore
        const createUserServiceSpy = jest.spyOn(UserService, 'createUser').mockRejectedValue(new Error('Something went wrong'));

        const {statusCode} = await supertest(app).post('/api/users').send(userInput);

        expect(statusCode).toBe(409);

        expect(createUserServiceSpy).toHaveBeenCalled();
      });
    })
  });

  // creating a user session
  describe('create user session', () => {
    // a user can login with a valid username and password
    describe('given the username and password are valid', () => {
      it('should return a signed access token and refresh token', async () => {
        // @ts-ignore
        jest.spyOn(UserService, 'validatePassword').mockReturnValue(userPayload);
        // @ts-ignore
        jest.spyOn(SessionService, 'createSession').mockReturnValue(sessionPayload);

        const req = {
          get: () => 'PostmanRuntime/7.33.0',
          body: {
            email: userInput.email,
            password: userInput.password
          }
        }

        const send = jest.fn();
        const res = {
          send,
        }

        // @ts-ignore
        await createUserSessionHandler(req, res);

        expect(send).toHaveBeenCalledWith({
          accessToken: expect.any(String),
          refreshToken: expect.any(String)
        })
      });
    })
  })
})