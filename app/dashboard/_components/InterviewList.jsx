'use client';
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import { desc, eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import InterviewItemCard from './InterviewItemCard';
import { useLanguage } from '../../providers/LanguageProvider';

function InterviewList() {
  const { t } = useLanguage();

  const { user } = useUser();
  const [interviewList, setInterviewList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    user && GetInterviewList();
  }, [user]);

  const GetInterviewList = async () => {
    try {
      setIsLoading(true);

      const result = await db
        .select()
        .from(MockInterview)
        .where(
          eq(MockInterview.createdBy, user?.primaryEmailAddress?.emailAddress)
        )
        .orderBy(desc(MockInterview.id));

      console.log(result);
      setInterviewList(result);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // return (
  //   <div>
  //     <h2 className='font-medium text-xl'>{t('previousMock')}</h2>

  //     <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-3'>
  //       {interviewList?.length > 0
  //         ? interviewList.map((interview, index) => (
  //             <InterviewItemCard interview={interview} key={index} />
  //           ))
  //         : [1, 2, 3, 4].map((item, index) => (
  //             <div className='h-[100px] w-full bg-gray-200 animate-pulse rounded-lg '></div>
  //           ))}
  //     </div>
  //   </div>
  // );
  return (
    <div>
      <h2 className='font-medium text-xl'>{t('previousMock')}</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-3'>
        {isLoading ? (
          // Loading skeleton
          [...Array(3)].map((_, index) => (
            <div
              key={index}
              className='h-[100px] w-full bg-gray-200 animate-pulse rounded-lg'
            />
          ))
        ) : interviewList.length > 0 ? (
          // Interview list
          interviewList.map((interview, index) => (
            <InterviewItemCard interview={interview} key={index} />
          ))
        ) : (
          // Empty state
          <div className='col-span-full text-center py-10'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4'>
              <svg
                className='w-8 h-8 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-1'>
              {t('noInterviewsYet')}
            </h3>
            <p className='text-sm text-gray-500'>{t('createFirstInterview')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewList;
