import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-900 p-6 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-1">Visitor Prediction Market</h1>
        <p className="text-gray-300 mb-4">Predict which space design will attract more visitors</p>

        <div className="bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-lg font-semibold mb-1">
            Modern Shopping Mall vs Traditional Marketplace
          </h2>
          <p className="text-sm text-gray-400 mb-2">
            Which space design will attract more visitors in the next 7 days?
          </p>
          <p className="text-xs text-gray-500 mb-4">
            🕒 Ends: May 15, 2025, 11:59 PM 
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Modern Shopping Mall */}
            <div className="bg-gray-700 rounded-xl overflow-hidden border border-gray-600 shadow">
              <Image
                src="/mall.png"
                alt="Modern Shopping Mall"
                width={640}
                height={160}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <p className="text-sm text-gray-400 mb-1">Creator: MetaDesign Studio</p>
                <h3 className="text-md font-bold mb-2 text-white">Modern Shopping Mall</h3>
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>Current Price</span>
                  <span>OPC0.64</span>
                </div>
                <div className="h-2 bg-gray-600 rounded-full">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: '64%' }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">64%</p>
              </div>
            </div>

            {/* Traditional Marketplace */}
            <div className="bg-gray-700 rounded-xl overflow-hidden border border-gray-600 shadow">
              <Image
                src="/market.png"
                alt="Traditional Marketplace"
                width={640}
                height={160}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <p className="text-sm text-gray-400 mb-1">Creator: VirtualArch</p>
                <h3 className="text-md font-bold mb-2 text-white">Traditional Marketplace</h3>
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>Current Price</span>
                  <span>OPC0.36</span>
                </div>
                <div className="h-2 bg-gray-600 rounded-full">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: '36%' }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">36%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
