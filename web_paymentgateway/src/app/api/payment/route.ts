import type { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === "POST") {
    const payment = await Payment.create(req.body);
    return res.json(payment);
  }

  if (req.method === "GET") {
    const payments = await Payment.find().populate("checkoutId");
    return res.json(payments);
  }
}
