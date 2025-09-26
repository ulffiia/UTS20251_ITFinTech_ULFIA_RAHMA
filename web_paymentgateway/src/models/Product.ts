import mongoose, { Schema, models } from "mongoose";

const ProductSchema = new Schema({
  name: String,
  description: String,
  price: Number,
  category: String,
  image: String, 
});

const Product = models.Product || mongoose.model("Product", ProductSchema);
export default Product;
