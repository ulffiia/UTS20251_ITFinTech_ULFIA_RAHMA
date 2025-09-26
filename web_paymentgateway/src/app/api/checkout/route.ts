import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import Checkout from "@/models/Checkout";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === "POST") {
    const checkout = await Checkout.create(req.body);
    return res.json(checkout);
  }

  if (req.method === "GET") {
    const checkouts = await Checkout.find().populate("items.productId");
    return res.json(checkouts);
  }
}
