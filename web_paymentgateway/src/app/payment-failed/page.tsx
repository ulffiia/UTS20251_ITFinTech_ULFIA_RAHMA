export default function PaymentFailed() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="bg-white shadow-lg rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">❌ Payment Failed!</h1>
        <p className="mt-4 text-gray-700">
          Maaf, pembayaran Anda gagal atau dibatalkan.  
        </p>
        <a
          href="/checkout"
          className="mt-6 inline-block bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Coba Lagi
        </a>
      </div>
    </div>
  );
}
