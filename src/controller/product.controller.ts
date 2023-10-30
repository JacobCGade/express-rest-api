import { Request, Response } from "express";
import {CreateProductInput, DeleteProductInput, GetProductInput, UpdateProductInput} from "../schema/product.schema";
import {createProduct, deleteProduct, findProduct, updateProduct} from "../service/product.service";
import logger from "../utils/logger";

export async function createProductHandler(req: Request<{}, {}, CreateProductInput['body']>, res: Response) {
  const userId = res.locals.user._id;
  const body = req.body;

  try {
    const product = await createProduct({ ...body, user: userId });
    res.send(product)
  } catch (err: any) {
    logger.error(err);
    res.status(409).send(err.message);
  }
}

export async function getProductHandler(req: Request<GetProductInput['params']>, res: Response) {
  const productId = req.params.productId;

  const product = await findProduct({ productId });

  if (!product) {
    return res.sendStatus(404);
  }

  return res.send(product);
}

export async function updateProductHandler(req: Request<UpdateProductInput['params'], {}, UpdateProductInput['body']>, res: Response) {
  const userId = res.locals.user._id;
  const productId = req.params.productId;
  const update = req.body;

  const product = await findProduct({ productId });

  if (!product) {
    return res.sendStatus(404);
  }

  if (String(product.user) !== userId) {
    return res.sendStatus(403);
  }

  const updatedProduct = await updateProduct({ productId }, update, { new: true });

  return res.send(updatedProduct);
}

export async function deleteProductHandler(req: Request<DeleteProductInput['params']>, res: Response) {
  const userId = res.locals.user._id;
  const productId = req.params.productId;

  const product = await findProduct({ productId });

  if (!product) {
    return res.sendStatus(404);
  }

  if (String(product.user) !== userId) {
    return res.sendStatus(403);
  }

  await deleteProduct({ productId });

  return res.sendStatus(200);
}