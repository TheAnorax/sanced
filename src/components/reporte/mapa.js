import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function MapaMexico() {;


  

  useEffect(() => {
    axios.get('http://66.232.105.87:3007/api/kpi/getHstorico2024')
      .then(response => {
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div className="flex">
      <div id="map" style={{ width: '60%', height: '600px' }}></div>
      <div style={{ width: '40%', padding: '1rem', color: '#000' }}>
      </div>
    </div>
  );
}
