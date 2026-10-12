import Cart from "../models/carts.model.js";
import Product from "../models/products.model.js";
import express from "express";

const cartsRouter = express.Router();

cartsRouter.post("/", async (req, res) => {
  try {
    const cart = await Cart.create({});
    res.status(201).json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Error adding cart" });
  }
});

cartsRouter.post("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const quantity = req.body.quantity || 1;

    //Verificar que el producto exista
    const product = await Product.findById(pid);
    if (!product) {
      return res
        .status(404)
        .json({ status: "error", error: "Product not found" });
    }
    //Verificar que el carrito exista
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res.status(404).json({ status: "error", error: "Cart not found" });
    }
    //Buscamos si el producto ya está en el carrito
    const productIndex = cart.products.findIndex(
      (p) => p.product.toString() === pid,
    );
    if (productIndex !== -1) {
      //Si el producto ya está en el carrito, actualizamos la cantidad
      cart.products[productIndex].quantity += quantity;
    } else {
      //Si el producto no está en el carrito, lo agregamos
      cart.products.push({ product: pid, quantity });
    }
    //Guardar el carrito actualizado
    const updatedCart = await cart.save();
    res.status(200).json({ status: "success", payload: updatedCart });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", error: "Error adding product to cart" });
  }
});

cartsRouter.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await Cart.findById(cid).populate("products.product");
    if (!cart) {
      return res.status(404).json({ status: "error", error: "Cart not found" });
    }
    res.status(200).json({ status: "success", payload: cart.products });
  } catch (error) {
    res.status(500).json({ status: "error", error: "Error fetching cart" });
  }
});

cartsRouter.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;

    const cart = await Cart.findById(cid);

    if (!cart) {
      return res.status(404).json({ status: "error", error: "Cart not found" });
    }

    cart.products = cart.products.filter((p) => p.product.toString() !== pid);

    const updatedCart = await cart.save();

    res.status(200).json({
      status: "success",
      payload: updatedCart,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: "Error removing product from cart",
    });
  }
});

cartsRouter.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;

    const cart = await Cart.findById(cid);

    if (!cart) {
      return res.status(404).json({ status: "error", error: "Cart not found" });
    }

    cart.products = [];

    const updatedCart = await cart.save();

    res.status(200).json({
      status: "success",
      payload: updatedCart,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      error: "Error clearing cart",
    });
  }
});

export default cartsRouter;
