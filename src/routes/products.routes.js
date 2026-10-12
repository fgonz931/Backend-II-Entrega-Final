import express from "express";
import Product from "../models/products.model.js";

const productsRouter = express.Router();

productsRouter.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, sort, query } = req.query;

    let filter = {};
    if (query) {
      filter.category = query;
    }

    let sortOption = {};
    if (sort === "asc") {
      sortOption.price = 1;
    } else if (sort === "desc") {
      sortOption.price = -1;
    }

    const data = await Product.paginate(filter, {
      limit: parseInt(limit),
      page: parseInt(page),
      sort: sortOption,
      lean: true,
    });
    const products = data.docs;
    delete data.docs;

    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
    const prevLink = data.hasPrevPage
      ? `${baseUrl}?page=${data.prevPage}&limit=${limit}`
      : null;
    const nextLink = data.hasNextPage
      ? `${baseUrl}?page=${data.nextPage}&limit=${limit}`
      : null;

    res.status(200).json({
      status: "success",
      payload: products,
      totalPages: data.totalPages,
      prevPage: data.prevPage,
      nextPage: data.nextPage,
      page: data.page,
      hasPrevPage: data.hasPrevPage,
      hasNextPage: data.hasNextPage,
      prevLink,
      nextLink,
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Error fetching products" });
  }
});

productsRouter.post("/", async (req, res) => {
  try {
    const productData = req.body;
    const newProduct = await Product.create(productData);
    res.status(201).json({ status: "success", payload: newProduct });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Error adding products" });
  }
});

productsRouter.put("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const updateData = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true, runValidators: true },
    );
    if (!updatedProduct) {
      return res
        .status(404)
        .json({ status: "error", error: "Product not found" });
    }
    res.status(200).json({ status: "success", payload: updatedProduct });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Error updating product" });
  }
});

productsRouter.delete("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return res
        .status(404)
        .json({ status: "error", message: "Product not found" });
    }
    res.status(200).json({ status: "success", payload: deletedProduct });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Error deleting product" });
  }
});
export default productsRouter;
