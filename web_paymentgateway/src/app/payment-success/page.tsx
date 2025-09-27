export default function PaymentSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white shadow-lg rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-green-600">✅ Payment Successful!</h1>
        <p className="mt-4 text-gray-700">
          Terima kasih, pembayaran Anda berhasil diproses.  
        </p>
        <a
          href="/"
          className="mt-6 inline-block bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          Kembali ke Home
        </a>
      </div>
    </div>
  );
}
