import mongoose from "mongoose";
import paginate from "mongoose-paginate-v2";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 500,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: Boolean,
      default: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Auriculares", "Teclados", "Mouse"],
    },
    thumbnail: {
      type: String,
      trim: true,
      default:
        "https://tccommercear.vtexassets.com/arquivos/ids/160894/158062-800-auto.png?v=638677160450000000",
    },
  },
  { timestamps: true },
);

productSchema.plugin(paginate);

//Indexacion
//Indice de tipo único para el campo "title"
productSchema.index({ title: 1 }, { unique: true });
//Indice de tipo único para el campo "code"
productSchema.index({ code: 1 }, { unique: true });
//Indice para filtrar/ordenar por campo "price"
productSchema.index({ price: 1 });
//Indice para filtrar/ordenar por campo "category"
productSchema.index({ category: 1 });
//Indice compuesto para filtrar por "category" y ordenar por "price"
productSchema.index({ category: 1, price: 1 });

//Indice para busqueda por texto en el campo "description"
productSchema.index({ description: "text" });
//
const Product = mongoose.model("Product", productSchema);

export default Product;
