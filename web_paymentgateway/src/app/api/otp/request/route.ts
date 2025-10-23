import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import Otp from '@/models/Otp';
import { sendWhatsapp } from '@/lib/fonnte';
import { hash } from '@/lib/auth';

const gen = () => Math.floor(100000 + Math.random()*900000).toString();

export async function POST(req: Request) {
  await connectDB();
  const { phone, purpose='login' } = await req.json();
  const user = await User.findOne({ phone });
  if (!user) return NextResponse.json({ error: 'Phone belum terdaftar' }, { status: 404 });

  const code = gen();
  await Otp.create({
    userId: user._id,
    phone,
    codeHash: await hash(code),
    purpose,
    expiresAt: new Date(Date.now() + 5*60*1000),
  });

  const msg = (process.env.FONNTE_OTP_TEMPLATE || 'OTP {{OTP}}').replace('{{OTP}}', code);
  await sendWhatsapp(phone, msg);
  return NextResponse.json({ ok: true });
}
