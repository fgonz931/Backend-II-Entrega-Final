import productService from "../services/products.service.js";

export const getProducts = async (req, res, next) => {
  try {
    const result = await productService.getProducts(req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { pid } = req.params;
    const product = await productService.getProductById(pid);

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const newProduct = await productService.createProduct(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { pid } = req.params;

    const updated = await productService.updateProduct(pid, req.body);

    if (!updated) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { pid } = req.params;

    const deleted = await productService.deleteProduct(pid);

    if (!deleted) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.status(200).json({ message: "Producto eliminado" });
  } catch (error) {
    next(error);
  }
};
