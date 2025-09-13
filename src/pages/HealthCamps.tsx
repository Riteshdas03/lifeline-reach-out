import Header from '@/components/Header';
import HealthCamps from '@/components/HealthCamps';

const HealthCampsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Header />
      
      <main className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Health <span className="text-green-600">Camps</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Free and affordable health checkups and medical drives in your community
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <HealthCamps />
          </div>
        </div>
      </main>
    </div>
  );
};

export default HealthCampsPage;