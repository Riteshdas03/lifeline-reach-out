import Header from '@/components/Header';
import HospitalFinder from '@/components/HospitalFinder';

const FindHospitals = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header />
      
      <main className="py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Find <span className="text-blue-600">Hospitals</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Locate trusted hospitals and medical facilities in your area with real-time availability
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <HospitalFinder />
          </div>
        </div>
      </main>
    </div>
  );
};

export default FindHospitals;