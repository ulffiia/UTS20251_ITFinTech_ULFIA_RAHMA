import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    hasMongoUri: Boolean(process.env.MONGODB_URI),
    uriPrefix: process.env.MONGODB_URI?.slice(0, 20), // aman: hanya prefix
  });
}
