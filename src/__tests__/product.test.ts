import supertest from "supertest";
import createServer from "../utils/server";
import {createProduct} from "../service/product.service";
import mongoose from "mongoose";
import {describe} from "node:test";
import {signJWT} from "../utils/jwt.utils";
import { MongoMemoryServer } from 'mongodb-memory-server';

const app = createServer();

const userId = new mongoose.Types.ObjectId().toString();
export const productPayload = {
  "user": userId,
  "title": "Canon EOS 1500D DSLR Camera with 18-55mm Lens",
  "description": "Designed for first-time DSLR owners who want impressive results straight out of the box, capture those magic moments no matter your level with the EOS 1500D. With easy to use automatic shooting modes, large 24.1 MP sensor, Canon Camera Connect app integration and built-in feature guide, EOS 1500D is always ready to go.",
  "price": 879.99,
  "image": "https://i.imgur.com/QlRphfQ.jpg"
}

export const userPayload = {
  _id: userId,
  email: "janeDoe@example.com",
  name: "Jane Doe",
}


describe('product', () => {
  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();

    await mongoose.connect(mongoServer.getUri())
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  describe('get product route', () => {
    describe('given the product does not exist', () => {
      it("should return 404", async () => {
        const productId = "product_5f2f8f2a45e7b40017c1f2b0";
        return supertest(app).get('/api/products/' + productId).expect(404);

      });
    });

    describe('given the product does exist', () => {
      it("should return 200 and a product", async () => {
        const product = await createProduct(productPayload)

        const {body, statusCode} = await supertest(app).get('/api/products/' + product.productId)

        expect(statusCode).toBe(200)
        expect(body.productId).toEqual(product.productId)

      });
    });
  });
  describe('create product route', () => {
    describe('given the user is not logged in', () => {
      it('should return 403', async () => {
        const {statusCode} = await supertest(app).post('/api/products').send(productPayload)

        expect(statusCode).toBe(403)
      });
    });

    describe('given the user is logged in', () => {
      it('should return 200 and create the product', async () => {
        const jwt = signJWT(userPayload)

        const {body, statusCode} = await supertest(app).post('/api/products')
          .set('Authorization', `Bearer ${jwt}`)
          .send(productPayload)

        expect(statusCode).toBe(200)
        expect(body).toEqual({"__v": 0,
          "_id": expect.any(String),
          "createdAt": expect.any(String),
          "description": "Designed for first-time DSLR owners who want impressive results straight out of the box, capture those magic moments no matter your level with the EOS 1500D. With easy to use automatic shooting modes, large 24.1 MP sensor, Canon Camera Connect app integration and built-in feature guide, EOS 1500D is always ready to go.",
          "image": "https://i.imgur.com/QlRphfQ.jpg",
          "price": 879.99,
          "productId": expect.any(String),
          "title": "Canon EOS 1500D DSLR Camera with 18-55mm Lens",
          "updatedAt": expect.any(String),
          "user": expect.any(String)})
      });
    });
  });
});
