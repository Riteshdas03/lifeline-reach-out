
import React from 'react';

const MapLegend = () => {
  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2">
      <div className="flex items-center space-x-2 text-sm">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Open</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span>Full</span>
        </div>
      </div>
    </div>
  );
};

export default MapLegend;
