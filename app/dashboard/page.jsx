import { UserButton } from '@clerk/nextjs';
import React from 'react';

function Dashboard() {
  return (
    <div className='p-10'>
      <h2 className='font-bold text-3xl text-primary'>Dashboard</h2>
      <h2 className='text-gray-500'>
        Create and Start your AI Mockup Interview - 새로운 면접을 만들어보세요
      </h2>

      <div className='grid grid-cols-1 md:grid-cols-3 my-5 gap-5'></div>

      {/* Previous Interview List  */}
    </div>
  );
}

export default Dashboard;
