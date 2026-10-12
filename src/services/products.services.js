import Product from "../models/product.model.js";

const getProducts = async (query) => {
  const { page = 1, limit = 10 } = query;

  const data = await Product.paginate(
    {},
    {
      page: parseInt(page),
      limit: parseInt(limit),
    },
  );

  return {
    status: "success",
    payload: data.docs,
    totalPages: data.totalPages,
    page: data.page,
    hasNextPage: data.hasNextPage,
    hasPrevPage: data.hasPrevPage,
  };
};

const getProductById = async (id) => {
  return await Product.findById(id);
};

const createProduct = async (productData) => {
  return await Product.create(productData);
};

const updateProduct = async (id, updateData) => {
  return await Product.findByIdAndUpdate(id, updateData, { new: true });
};

const deleteProduct = async (id) => {
  return await Product.findByIdAndDelete(id);
};

export default {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
