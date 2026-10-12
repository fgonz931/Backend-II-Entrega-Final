import express from "express";
import Product from "../models/products.model.js";
import Cart from "../models/carts.model.js";

const viewsRouter = express.Router();

viewsRouter.get("/", async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const data = await Product.paginate(
      {},
      { limit: parseInt(limit), page: parseInt(page), lean: true },
    );
    const products = data.docs;
    delete data.docs;

    const links = [];
    for (let i = 1; i <= data.totalPages; i++) {
      links.push({
        text: i,
        link: `?limit=${limit}&page=${i}`,
      });
    }

    res.render("home", { products, links });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Error fetching products" });
  }
});

viewsRouter.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      return res
        .status(404)
        .json({ status: "error", error: "Product not found" });
    }

    res.render("productDetail", { product });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", error: "Error loading product details" });
  }
});

viewsRouter.get("/carts/:cid", async (req, res) => {
  const cart = await Cart.findById(req.params.cid)
    .populate("products.product")
    .lean();

  res.render("cart", { cart });
});

export default viewsRouter;
