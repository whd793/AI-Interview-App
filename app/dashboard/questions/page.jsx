// app/dashboard/questions/page.jsx
'use client';
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { eq } from 'drizzle-orm';
import { useLanguage } from '@/app/providers/LanguageProvider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function QuestionsPage() {
  const { user } = useUser();
  const { t } = useLanguage();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getInterviews();
    }
  }, [user]);

  const getInterviews = async () => {
    try {
      const result = await db
        .select()
        .from(MockInterview)
        .where(
          eq(MockInterview.createdBy, user?.primaryEmailAddress?.emailAddress)
        );

      // Parse JSON responses and organize data
      const interviewsWithQuestions = result.map((interview) => ({
        ...interview,
        questions: JSON.parse(interview.jsonMockResp),
      }));

      setInterviews(interviewsWithQuestions);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary'></div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6 max-w-4xl'>
      <h1 className='text-2xl font-bold mb-6'>{t('allQuestions')}</h1>

      {interviews.length === 0 ? (
        <div className='text-center py-10 bg-gray-50 rounded-lg'>
          <p className='text-gray-500'>{t('noInterviewsYet')}</p>
        </div>
      ) : (
        <div className='space-y-6'>
          {interviews.map((interview) => (
            <div
              key={interview.mockId}
              className='bg-white rounded-lg shadow-sm border'
            >
              <div className='p-4 border-b'>
                <h2 className='font-semibold text-lg'>
                  {interview.jobPosition}
                </h2>
                <div className='text-sm text-gray-500 mt-1'>
                  <span>{interview.jobDesc}</span>
                  <span className='mx-2'>•</span>
                  <span>
                    {interview.jobExperience} {t('yearsExp')}
                  </span>
                  <span className='mx-2'>•</span>
                  <span>{interview.createdAt}</span>
                </div>
              </div>

              <Accordion type='single' collapsible className='w-full'>
                {interview.questions.map((question, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className='px-4'>
                      <div className='text-left'>
                        <span className='text-primary font-medium mr-2'>
                          Q{index + 1}.
                        </span>
                        {question.question}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className='px-4 py-3 bg-gray-50'>
                      <div className='text-sm text-gray-600'>
                        <p className='font-medium mb-2'>
                          {t('suggestedAnswer')}:
                        </p>
                        <p className='whitespace-pre-wrap'>{question.answer}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
