import React from 'react';
import BusCard from './BusCard';

const BusList = ({ buses }) => {
  return (
    <div>
      {buses.map(bus => (
        <BusCard key={bus.id} bus={bus} />
      ))}
    </div>
  );
};

export default BusList;