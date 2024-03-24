'use client';
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import QuestionsSection from './_components/QuestionsSection';
import RecordAnswerSection from './_components/RecordAnswerSection';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LoaderCircle } from 'lucide-react';

import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Flag } from 'lucide-react';
import { useLanguage } from '@/app/providers/LanguageProvider';

function StartInterview({ params }) {
  const { t } = useLanguage();

  const [interviewData, setInterviewData] = useState();
  const [mockInterviewQuestion, setMockInterviewQuestion] = useState();
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false); // Add this state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    GetInterviewDetails();
  }, []);

  /**
   * Used to Get Interview Details by MockId/Interview Id
   */
  const GetInterviewDetails = async () => {
    setIsLoading(true);

    try {
      const result = await db
        .select()
        .from(MockInterview)
        .where(eq(MockInterview.mockId, params.interviewId));

      const jsonMockResp = JSON.parse(result[0].jsonMockResp);
      console.log(jsonMockResp);
      setMockInterviewQuestion(jsonMockResp);
      setInterviewData(result[0]);
    } catch (error) {
      console.error('Error fetching interview details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const progress = mockInterviewQuestion
    ? ((activeQuestionIndex + 1) / mockInterviewQuestion.length) * 100
    : 0;

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary'></div>
      </div>
    );
  }

  // return (
  //   <div>
  //     <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
  //       {/* Questions  */}
  //       <QuestionsSection
  //         mockInterviewQuestion={mockInterviewQuestion}
  //         activeQuestionIndex={activeQuestionIndex}
  //       />

  //       {/* Video/ Audio Recording  */}
  //       <RecordAnswerSection
  //         mockInterviewQuestion={mockInterviewQuestion}
  //         activeQuestionIndex={activeQuestionIndex}
  //         interviewData={interviewData}
  //         setIsProcessing={setIsProcessing} // Pass this down
  //       />
  //     </div>
  //     <div className='flex justify-end gap-6'>
  //       {/* {activeQuestionIndex > 0 && (
  //         <Button
  //           onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
  //         >
  //           Previous Question
  //         </Button>
  //       )}
  //       {activeQuestionIndex != mockInterviewQuestion?.length - 1 && (
  //         <Button
  //           onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
  //         >
  //           Next Question
  //         </Button>
  //       )}
  //       {activeQuestionIndex == mockInterviewQuestion?.length - 1 && (
  //         <Link
  //           href={'/dashboard/interview/' + interviewData?.mockId + '/feedback'}
  //         >
  //           <Button>End Interview</Button>
  //         </Link>
  //       )} */}
  //       {isProcessing && (
  //         <div className='flex items-center gap-2 text-primary'>
  //           <LoaderCircle className='animate-spin' />
  //           <span>Processing answer...</span>
  //         </div>
  //       )}
  //       {activeQuestionIndex > 0 && (
  //         <Button
  //           onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
  //           disabled={isProcessing}
  //         >
  //           Previous Question
  //         </Button>
  //       )}
  //       {activeQuestionIndex != mockInterviewQuestion?.length - 1 && (
  //         <Button
  //           onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
  //           disabled={isProcessing}
  //         >
  //           Next Question
  //         </Button>
  //       )}
  //       {activeQuestionIndex == mockInterviewQuestion?.length - 1 && (
  //         <Link
  //           href={'/dashboard/interview/' + interviewData?.mockId + '/feedback'}
  //         >
  //           <Button disabled={isProcessing}>End Interview</Button>
  //         </Link>
  //       )}
  //     </div>
  //   </div>
  // );

  return (
    <div className='container mx-auto px-4 py-8 max-w-7xl'>
      <div className='mb-8'>
        <div className='flex items-center justify-between mb-4'>
          <h1 className='text-2xl font-bold'>
            {t('question')} {activeQuestionIndex + 1} /{' '}
            {mockInterviewQuestion?.length}
          </h1>
          <Link
            href={'/dashboard'}
            className='text-gray-500 hover:text-gray-700'
          >
            <Button variant='ghost'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              {t('backToDashboard')}
            </Button>
          </Link>
        </div>
        <Progress value={progress} className='h-2' />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <QuestionsSection
            mockInterviewQuestion={mockInterviewQuestion}
            activeQuestionIndex={activeQuestionIndex}
          />
        </div>
        <div className='bg-white rounded-lg shadow-sm border p-6'>
          <RecordAnswerSection
            mockInterviewQuestion={mockInterviewQuestion}
            activeQuestionIndex={activeQuestionIndex}
            interviewData={interviewData}
            setIsProcessing={setIsProcessing}
          />
        </div>
      </div>

      <div className='flex justify-between items-center bg-white rounded-lg shadow-sm border p-4'>
        <div>
          {isProcessing && (
            <div className='flex items-center gap-2 text-primary'>
              <LoaderCircle className='animate-spin' />
              <span>Processing answer...</span>
            </div>
          )}
          {activeQuestionIndex > 0 && (
            <Button
              variant='outline'
              onClick={() => setActiveQuestionIndex(activeQuestionIndex - 1)}
              className='flex items-center'
              disabled={isProcessing}
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              {t('previousQuestion')}
            </Button>
          )}
        </div>
        <div className='flex gap-4'>
          {activeQuestionIndex !== mockInterviewQuestion?.length - 1 && (
            <Button
              onClick={() => setActiveQuestionIndex(activeQuestionIndex + 1)}
              className='flex items-center'
              disabled={isProcessing}
            >
              {t('nextQuestion')}
              <ArrowRight className='ml-2 h-4 w-4' />
            </Button>
          )}
          {activeQuestionIndex === mockInterviewQuestion?.length - 1 && (
            <Link
              href={`/dashboard/interview/${interviewData?.mockId}/feedback`}
            >
              <Button
                className='flex items-center bg-green-600 hover:bg-green-700'
                disabled={isProcessing}
              >
                <Flag className='mr-2 h-4 w-4' />
                {t('endInterview')}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default StartInterview;
