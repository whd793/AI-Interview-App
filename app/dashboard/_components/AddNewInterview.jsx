// app/dashboard/_components/AddNewInterview
'use client';
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { chatSession } from '@/utils/GeminiAIModal';
import { LoaderCircle, Globe } from 'lucide-react';
import { db } from '@/utils/db';
// import { MockInterview } from '@/utils/schema';
import { MockInterview, UserCredits } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { useLanguage } from '@/app/providers/LanguageProvider';
function AddNewInterview() {
  const { t } = useLanguage();

  const [openDialog, setOpenDialog] = useState(false);
  const [jobPosition, setJobPosition] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobExperience, setJobExperience] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [jsonResponse, setJsonResponse] = useState([]);
  const [savedLanguage, setSavedLanguage] = useState(
    localStorage.getItem('preferred-language') || ''
  );
  const router = useRouter();
  const { user } = useUser();

  // Add these state variables at the top of your component
  const [showNoCreditsDialog, setShowNoCreditsDialog] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');

  const languages = [
    {
      code: 'en',
      name: 'English',
      prompt: 'Generate the questions and answers in English',
    },
    {
      code: 'ko',
      name: '한국어',
      prompt: '질문과 답변을 한국어로 생성해주세요',
    },
    {
      code: 'ja',
      name: '日本語',
      prompt: '質問と回答を日本語で生成してください',
    },
    { code: 'zh', name: '中文', prompt: '请用中文生成问题和答案' },
  ];

  useEffect(() => {
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
    }
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();

    // Check and create credits if needed
    let userCredits = await db
      .select()
      .from(UserCredits)
      .where(
        eq(UserCredits.userEmail, user?.primaryEmailAddress?.emailAddress)
      );

    if (!userCredits.length) {
      // First time user - create credits
      await db.insert(UserCredits).values({
        userEmail: user.primaryEmailAddress.emailAddress,
        credits: 5,
        lastUpdated: new Date(),
      });
      userCredits = [{ credits: 5 }];
    }

    // if (!userCredits.length || userCredits[0].credits <= 0) {
    //   toast.error(
    //     <div className='flex flex-col gap-2'>
    //       <span>{t('noCredits')}</span>
    //       <span className='text-sm text-gray-500'>{t('waitForCredits')}</span>
    //     </div>
    //   );
    //   setOpenDialog(false);
    //   return;
    // }

    if (!userCredits.length || userCredits[0].credits <= 0) {
      setShowNoCreditsDialog(true);
      setOpenDialog(false);
      return;
    }

    // Update the credits check in onSubmit
    if (!userCredits.length || userCredits[0].credits <= 0) {
      // Get time left from UserCredits
      const currentCredits = await db
        .select()
        .from(UserCredits)
        .where(
          eq(UserCredits.userEmail, user?.primaryEmailAddress?.emailAddress)
        );

      // Calculate time left
      if (currentCredits[0]?.lastUpdated) {
        const now = moment();
        const nextUpdate = moment(currentCredits[0].lastUpdated).add(
          1,
          'minute'
        );
        const duration = moment.duration(nextUpdate.diff(now));
        setTimeLeft(
          `${duration.minutes()}:${String(duration.seconds()).padStart(2, '0')}`
        );
      }

      setShowNoCreditsDialog(true);
      return;
    }

    setLoading(true);
    const selectedLangPrompt =
      languages.find((lang) => lang.code === selectedLanguage)?.prompt ||
      'Generate in English';

    const InputPrompt = `
      Job position: ${jobPosition}
      Job Description: ${jobDesc}
      Years of Experience: ${jobExperience}
      
      Based on the above job details, please provide ${
        process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT
      } interview questions and answers.
      ${selectedLangPrompt}.
      
      Return the response in JSON format with 'question' and 'answer' fields for each item.
      Keep the JSON structure but generate content in ${
        languages.find((lang) => lang.code === selectedLanguage)?.name
      }.
    `;

    try {
      const result = await chatSession.sendMessage(InputPrompt);
      const MockJsonResp = result.response
        .text()
        .replace('```json', '')
        .replace('```', '')
        .trim();

      console.log('Generated response:', JSON.parse(MockJsonResp));
      setJsonResponse(MockJsonResp);

      // Check credits again before saving - get the latest count
      const currentCredits = await db
        .select()
        .from(UserCredits)
        .where(
          eq(UserCredits.userEmail, user?.primaryEmailAddress?.emailAddress)
        );

      if (!currentCredits.length || currentCredits[0].credits <= 0) {
        toast.error(t('noCredits'));
        return;
      }

      const resp = await db
        .insert(MockInterview)
        .values({
          mockId: uuidv4(),
          jsonMockResp: MockJsonResp,
          jobPosition: jobPosition,
          jobDesc: jobDesc,
          jobExperience: jobExperience,
          language: selectedLanguage,
          createdBy: user?.primaryEmailAddress?.emailAddress,
          createdAt: moment().format('DD-MM-yyyy'),
        })
        .returning({ mockId: MockInterview.mockId });

      // Deduct credit but don't update lastUpdated
      await db
        .update(UserCredits)
        .set({
          // credits: userCredits[0].credits - 1,
          credits: currentCredits[0].credits - 1,
        })
        .where(
          eq(UserCredits.userEmail, user?.primaryEmailAddress?.emailAddress)
        );

      if (resp?.[0]?.mockId) {
        setOpenDialog(false);
        router.push('/dashboard/interview/' + resp[0].mockId);
      }
    } catch (error) {
      console.error('Error generating interview:', error);
      toast.error(t('errorGenerating'));
    } finally {
      setLoading(false);
    }
  };
  // const onSubmit = async (e) => {
  //   e.preventDefault();

  //   // Check credits first
  //   const userCredits = await db
  //     .select()
  //     .from(UserCredits)
  //     .where(
  //       eq(UserCredits.userEmail, user?.primaryEmailAddress?.emailAddress)
  //     );

  //   // if (!userCredits.length || userCredits[0].credits <= 0) {
  //   //   toast.error(t('noCredits'));
  //   //   return;
  //   // }

  //   if (!userCredits.length || userCredits[0].credits <= 0) {
  //     toast.error(
  //       <div className='flex flex-col gap-2'>
  //         <span>{t('noCredits')}</span>
  //         <span className='text-sm text-gray-500'>{t('waitForCredits')}</span>
  //       </div>
  //     );
  //     setOpenDialog(false);
  //     return;
  //   }

  //   setLoading(true);
  //   const selectedLangPrompt =
  //     languages.find((lang) => lang.code === selectedLanguage)?.prompt ||
  //     'Generate in English';

  //   const InputPrompt = `
  //     Job position: ${jobPosition}
  //     Job Description: ${jobDesc}
  //     Years of Experience: ${jobExperience}

  //     Based on the above job details, please provide ${
  //       process.env.NEXT_PUBLIC_INTERVIEW_QUESTION_COUNT
  //     } interview questions and answers.
  //     ${selectedLangPrompt}.

  //     Return the response in JSON format with 'question' and 'answer' fields for each item.
  //     Keep the JSON structure but generate content in ${
  //       languages.find((lang) => lang.code === selectedLanguage)?.name
  //     }.
  //   `;

  //   try {
  //     const result = await chatSession.sendMessage(InputPrompt);
  //     const MockJsonResp = result.response
  //       .text()
  //       .replace('```json', '')
  //       .replace('```', '')
  //       .trim();

  //     console.log('Generated response:', JSON.parse(MockJsonResp));
  //     setJsonResponse(MockJsonResp);

  //     const resp = await db
  //       .insert(MockInterview)
  //       .values({
  //         mockId: uuidv4(),
  //         jsonMockResp: MockJsonResp,
  //         jobPosition: jobPosition,
  //         jobDesc: jobDesc,
  //         jobExperience: jobExperience,
  //         language: selectedLanguage,
  //         createdBy: user?.primaryEmailAddress?.emailAddress,
  //         createdAt: moment().format('DD-MM-yyyy'),
  //       })
  //       .returning({ mockId: MockInterview.mockId });

  //     // Deduct credit after successful creation
  //     await db
  //       .update(UserCredits)
  //       .set({
  //         credits: userCredits[0].credits - 1,
  //         // lastUpdated: moment().toDate(), // Add this line to update the timestamp

  //         // lastUpdated: new Date(),
  //       })
  //       .where(
  //         eq(UserCredits.userEmail, user?.primaryEmailAddress?.emailAddress)
  //       );

  //     if (resp?.[0]?.mockId) {
  //       setOpenDialog(false);
  //       router.push('/dashboard/interview/' + resp[0].mockId);
  //     }
  //   } catch (error) {
  //     console.error('Error generating interview:', error);
  //     // You might want to show an error toast here
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div>
      <div
        className='p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all border-dashed'
        onClick={() => setOpenDialog(true)}
      >
        <h2 className='text-lg text-center'>{t('addNew')}</h2>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className='max-w-xl'>
          <DialogHeader>
            <DialogTitle className='text-2xl'>{t('tellMore')}</DialogTitle>
            <DialogDescription>
              <form onSubmit={onSubmit} className='space-y-6'>
                <div className='space-y-4'>
                  <div className='flex justify-end'>
                    <label className='block text-sm font-medium content-center mr-2'>
                      {t('questionLanguage')}:{' '}
                    </label>
                    <Select
                      value={selectedLanguage}
                      onValueChange={setSelectedLanguage}
                    >
                      <SelectTrigger className='w-[180px]'>
                        <SelectValue placeholder={t('selectLanguage')} />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            <div className='flex items-center gap-2'>
                              <Globe className='w-4 h-4' />
                              {lang.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className='block text-sm font-medium mb-2'>
                      {t('jobRole')}
                    </label>
                    <Input
                      placeholder={t('jobRolePlaceholder')}
                      required
                      onChange={(e) => setJobPosition(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium mb-2'>
                      {t('jobDesc')}
                    </label>
                    <Textarea
                      placeholder={t('jobDescPlaceholder')}
                      required
                      onChange={(e) => setJobDesc(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium mb-2'>
                      {t('yearsExp')}
                    </label>
                    <Input
                      placeholder={t('yearsExpPlaceholder')}
                      type='number'
                      max='100'
                      required
                      onChange={(e) => setJobExperience(e.target.value)}
                    />
                  </div>
                </div>

                <div className='flex gap-4 justify-end'>
                  <Button
                    type='button'
                    variant='ghost'
                    onClick={() => setOpenDialog(false)}
                  >
                    {t('cancel')}
                  </Button>
                  <Button type='submit' disabled={loading}>
                    {loading ? (
                      <span className='flex items-center gap-2'>
                        <LoaderCircle className='animate-spin' />
                        {t('generatingAI')}
                      </span>
                    ) : (
                      t('startInterview')
                    )}
                  </Button>
                </div>
              </form>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={showNoCreditsDialog} onOpenChange={setShowNoCreditsDialog}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>{t('noCredits')}</DialogTitle>
            <DialogDescription>
              <p>{t('waitForCredits')}</p>
            </DialogDescription>
            {/* <Button
              onClick={() => setShowNoCreditsDialog(false)}
              className='mt-4'
            >
              {t('close')}
            </Button> */}
            <div className='flex gap-4 justify-end'>
              {/* <Button
                type='button'
                variant='ghost'
                onClick={() => setOpenDialog(false)}
              >
                {t('cancel')}
              </Button> */}
              <Button
                onClick={() => setShowNoCreditsDialog(false)}
                className='mt-4'
              >
                {t('close')}
              </Button>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AddNewInterview;
