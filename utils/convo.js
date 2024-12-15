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
import { MockInterview } from '@/utils/schema';
import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@clerk/nextjs';
import moment from 'moment';
import { useRouter } from 'next/navigation';

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

    // Check credits first
    const userCredits = await db
      .select()
      .from(UserCredits)
      .where(
        eq(UserCredits.userEmail, user?.primaryEmailAddress?.emailAddress)
      );

    if (!userCredits.length || userCredits[0].credits <= 0) {
      toast.error(t('noCredits'));
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

      // Deduct credit after successful creation
      await db
        .update(UserCredits)
        .set({
          credits: userCredits[0].credits - 1,
          lastUpdated: new Date(),
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
      // You might want to show an error toast here
    } finally {
      setLoading(false);
    }
  };
  return (
    <div>
      <div
        className='p-10 border rounded-lg bg-secondary hover:scale-105 hover:shadow-md cursor-pointer transition-all border-dashed'
        onClick={() => setOpenDialog(true)}
      >
        <h2 className='text-lg text-center'>{t('addNew')}</h2>
      </div>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className='max-w-2xl'>
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
    </div>
  );
}

export default AddNewInterview;



//app/dashboard/_components/Credits.jsx
'use client';
import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/utils/db';
import { UserCredits } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { useLanguage } from '@/app/providers/LanguageProvider';
import moment from 'moment';

function Credits() {
  const { user } = useUser();
  const { t } = useLanguage();
  const [credits, setCredits] = useState(5);
  const [nextCreditTime, setNextCreditTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');

  const fetchCredits = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return;

    let userCredits = await db
      .select()
      .from(UserCredits)
      .where(eq(UserCredits.userEmail, user.primaryEmailAddress.emailAddress));

    if (!userCredits.length) {
      // Create new user credits entry
      await db.insert(UserCredits).values({
        userEmail: user.primaryEmailAddress.emailAddress,
        credits: 5,
        lastUpdated: new Date(),
      });
      return 5;
    }

    const { credits: currentCredits, lastUpdated } = userCredits[0];
    const hoursSinceUpdate = moment().diff(moment(lastUpdated), 'hours');

    if (hoursSinceUpdate > 0 && currentCredits < 5) {
      const newCredits = Math.min(currentCredits + hoursSinceUpdate, 5);
      await db
        .update(UserCredits)
        .set({
          credits: newCredits,
          lastUpdated: new Date(),
        })
        .where(
          eq(UserCredits.userEmail, user.primaryEmailAddress.emailAddress)
        );
      return newCredits;
    }

    return currentCredits;
  };

  useEffect(() => {
    const initCredits = async () => {
      const currentCredits = await fetchCredits();
      setCredits(currentCredits);
    };

    initCredits();
    const interval = setInterval(initCredits, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = moment();
      const nextUpdate = moment().startOf('hour').add(1, 'hour');
      const duration = moment.duration(nextUpdate.diff(now));

      setTimeLeft(
        `${duration.minutes()}:${String(duration.seconds()).padStart(2, '0')}`
      );
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='flex items-center gap-4 bg-white rounded-lg shadow-sm border p-3'>
      <div className='flex flex-col items-center'>
        <span className='text-sm font-medium text-gray-600'>
          {t('credits')}
        </span>
        <div className='flex gap-1 mt-1'>
          {[...Array(5)].map((_, i) => (
            <Zap
              key={i}
              className={`w-5 h-5 ${
                i < credits
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-200 fill-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
      {credits < 5 && (
        <div className='flex flex-col items-center border-l pl-4'>
          <span className='text-sm font-medium text-gray-600'>
            {t('nextCredit')}
          </span>
          <span className='text-lg font-semibold text-primary'>{timeLeft}</span>
        </div>
      )}
    </div>
  );
}

export default Credits;


// app/dashboard/_components/Header.jsx
'use client';
import { UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import { useLanguage } from '../../providers/LanguageProvider';
import { Menu, Globe, X } from 'lucide-react';
import Credits from '@/components/Credits';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
// import { Globe } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

function Header() {
  const path = usePathname();
  const { t, language, setLanguage } = useLanguage();

  const menuItems = [
    { href: '/dashboard', label: 'dashboard' },
    { href: '/dashboard/questions', label: 'questions' },
    { href: '/dashboard/upgrade', label: 'upgrade' },
    { href: '/dashboard/analytics', label: 'analytics' },
    { href: '/how', label: 'howItWorks' },
  ];

  useEffect(() => {
    console.log(path);
  }, []);

  // return (
  //   <div className='flex p-4 items-center justify-between bg-secondary shadow-sm'>
  //     {/* <Image src={'/logo.svg'} width={160} height={100} alt='logo' /> */}
  //     <h1
  //       className={`text-primary font-bold
  //           cursor-pointer
  //           ${path == '/dashboard' && 'text-primary font-bold'}
  //           `}
  //     >
  //       InterviewHelp AI
  //     </h1>
  //     <ul className='hidden md:flex gap-6'>
  //       <Link href={'/dashboard'}>
  //         <li
  //           className={`hover:text-primary hover:font-bold transition-all
  //           cursor-pointer
  //           ${path == '/dashboard' && 'text-primary font-bold'}
  //           `}
  //         >
  //           Dashboard
  //         </li>
  //       </Link>

  //       <li
  //         className={`hover:text-primary hover:font-bold transition-all
  //           cursor-pointer
  //           ${path == '/dashboard/questions' && 'text-primary font-bold'}
  //           `}
  //       >
  //         Questions
  //       </li>
  //       <Link href={'/dashboard/upgrade'}>
  //         <li
  //           className={`hover:text-primary hover:font-bold transition-all
  //           cursor-pointer
  //           ${path == '/dashboard/upgrade' && 'text-primary font-bold'}
  //           `}
  //         >
  //           Upgrade
  //         </li>
  //       </Link>
  //       <li
  //         className={`hover:text-primary hover:font-bold transition-all
  //           cursor-pointer
  //           ${path == '/dashboard/how' && 'text-primary font-bold'}
  //           `}
  //       >
  //         How it Works?
  //       </li>
  //     </ul>
  //     <UserButton />
  //   </div>
  // );

  const NavLinks = ({ mobile, onItemClick }) => (
    <>
      {menuItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <li
            onClick={onItemClick}
            className={`hover:text-primary hover:font-bold transition-all cursor-pointer
              ${path === item.href && 'text-primary font-bold'}
              ${mobile ? 'py-4 border-b border-gray-100' : ''}
            `}
          >
            {t(item.label)}
          </li>
        </Link>
      ))}
    </>
  );

  // return (
  //   <div className='flex p-4 items-center justify-between bg-secondary shadow-sm'>
  //     <h1
  //       className={`text-primary font-bold cursor-pointer ${
  //         path == '/dashboard' && 'text-primary font-bold'
  //       }`}
  //     >
  //       InterviewHelp AI
  //     </h1>

  //     <ul className='hidden md:flex gap-6 items-center'>
  //       <Link href={'/dashboard'}>
  //         <li
  //           className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${
  //             path == '/dashboard' && 'text-primary font-bold'
  //           }`}
  //         >
  //           {t('dashboard')}
  //         </li>
  //       </Link>

  //       <Link href={'/dashboard/questions'}>
  //         <li
  //           className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${
  //             path == '/dashboard/questions' && 'text-primary font-bold'
  //           }`}
  //         >
  //           {t('questions')}
  //         </li>
  //       </Link>

  //       <Link href={'/dashboard/upgrade'}>
  //         <li
  //           className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${
  //             path == '/dashboard/upgrade' && 'text-primary font-bold'
  //           }`}
  //         >
  //           {t('upgrade')}
  //         </li>
  //       </Link>

  //       <Link href={'/dashboard/analytics'}>
  //         <li
  //           className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${
  //             path == '/dashboard/upgrade' && 'text-primary font-bold'
  //           }`}
  //         >
  //           {t('analytics')}
  //         </li>
  //       </Link>

  //       <Link href={'/dashboard/how'}>
  //         <li
  //           className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${
  //             path == '/dashboard/how' && 'text-primary font-bold'
  //           }`}
  //         >
  //           {t('howItWorks')}
  //         </li>
  //       </Link>
  //       <Select value={language} onValueChange={setLanguage}>
  //         <SelectTrigger className='w-[110px]'>
  //           <Globe className='mr-2 h-4 w-4' />
  //           <SelectValue>
  //             {language === 'ko' ? '한국어' : 'English'}
  //           </SelectValue>
  //         </SelectTrigger>
  //         <SelectContent>
  //           <SelectItem value='en'>
  //             <div className='flex items-center'>
  //               <span className='ml-2'>English</span>
  //             </div>
  //           </SelectItem>
  //           <SelectItem value='ko'>
  //             <div className='flex items-center'>
  //               <span className='ml-2'>한국어</span>
  //             </div>
  //           </SelectItem>
  //         </SelectContent>
  //       </Select>
  //     </ul>

  //     <div className='flex items-center gap-4'>
  //       <UserButton />
  //     </div>
  //   </div>
  // );

  return (
    <div className='flex p-4 items-center justify-between bg-secondary shadow-sm'>
      <Link href={'/'}>
        <h1 className='text-primary font-bold cursor-pointer'>
          InterviewHelp AI
        </h1>
      </Link>

      {/* Desktop Navigation */}
      <ul className='hidden md:flex gap-6 items-center'>
        <NavLinks />
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className='w-[110px]'>
            <Globe className='mr-2 h-4 w-4' />
            <SelectValue>
              {language === 'ko' ? '한국어' : 'English'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='en'>
              <div className='flex items-center'>
                <span className='ml-2'>English</span>
              </div>
            </SelectItem>
            <SelectItem value='ko'>
              <div className='flex items-center'>
                <span className='ml-2'>한국어</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </ul>

      {/* Mobile Navigation */}
      <div className='md:hidden flex items-center gap-4'>
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className='w-[90px]'>
            <Globe className='mr-2 h-4 w-4' />
            <SelectValue>
              {language === 'ko' ? '한국어' : 'English'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='en'>English</SelectItem>
            <SelectItem value='ko'>한국어</SelectItem>
          </SelectContent>
        </Select>

        <Sheet>
          <SheetTrigger asChild>
            <button className='p-2 hover:bg-gray-100 rounded-lg'>
              <Menu className='h-6 w-6' />
            </button>
          </SheetTrigger>
          <SheetContent side='right' className='w-[300px] sm:w-[400px]'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-lg font-semibold'>Menu</h2>
              {/* <SheetClose asChild>
                <button className='p-2 hover:bg-gray-100 rounded-lg'>
                  <X className='h-4 w-4' />
                </button>
              </SheetClose> */}
            </div>
            <ul className='flex flex-col'>
              <NavLinks
                mobile
                onItemClick={() =>
                  document.querySelector('[data-sheet-close]').click()
                }
              />
            </ul>
          </SheetContent>
        </Sheet>

        <UserButton />
        <Credits />
      </div>

      {/* Desktop UserButton */}
      <div className='hidden md:block'>
        <UserButton />
      </div>
    </div>
  );
}

export default Header;


import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useLanguage } from '../../providers/LanguageProvider';

function InterviewItemCard({ interview }) {
  const router = useRouter();

  const onStart = () => {
    router.push('/dashboard/interview/' + interview?.mockId);
  };

  const onFeedbackPress = () => {
    router.push('/dashboard/interview/' + interview.mockId + '/feedback');
  };

  //   return (
  //     <div className='border shadow-sm rounded-lg p-3'>
  //         <h2 className='font-bold text-primary'>{interview?.jobPosition}</h2>
  //         <h2 className='text-sm text-gray-600'>{interview?.jobExperience} Years of Experience</h2>
  //         <h2 className='text-xs text-gray-400'>Created At:{interview.createdAt}</h2>
  //         <div className='flex justify-between mt-2 gap-5'>
  //             <Button size="sm" variant="outline" className="w-full"
  //             onClick={onFeedbackPress}
  //             >Feedback</Button>
  //             <Button size="sm" className="w-full"
  //             onClick={onStart}
  //             >Start</Button>

  //         </div>
  //     </div>
  //   )
  const { t } = useLanguage();

  return (
    <div className='border shadow-sm rounded-lg p-3'>
      <h2 className='font-bold text-primary'>{interview?.jobPosition}</h2>
      <h2 className='text-sm text-gray-600'>
        {interview?.jobExperience} {t('yearsOfExperience')}
      </h2>
      <h2 className='text-xs text-gray-400'>
        {t('createdAt')}
        {interview.createdAt}
      </h2>
      <div className='flex justify-between mt-2 gap-5'>
        <Button
          size='sm'
          variant='outline'
          className='w-full'
          onClick={() =>
            router.push(
              '/dashboard/interview/' + interview.mockId + '/feedback'
            )
          }
        >
          {t('feedback')}
        </Button>
        <Button
          size='sm'
          className='w-full'
          onClick={() =>
            router.push('/dashboard/interview/' + interview?.mockId)
          }
        >
          {t('start')}
        </Button>
      </div>
    </div>
  );
}

export default InterviewItemCard;


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

// app/dashboard/analytics/page.jsx
// app/dashboard/analytics/page.jsx
'use client';
import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/utils/db';
import { UserAnswer, MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { useLanguage } from '@/app/providers/LanguageProvider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Trophy, Target, TrendingUp, AlertCircle, Clock } from 'lucide-react';

export default function AnalyticsDashboard() {
  const { user } = useUser();
  const { t } = useLanguage();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      // Fetch all user answers
      const answers = await db
        .select()
        .from(UserAnswer)
        .where(
          eq(UserAnswer.userEmail, user?.primaryEmailAddress?.emailAddress)
        );

      // Fetch all interviews
      const interviews = await db
        .select()
        .from(MockInterview)
        .where(
          eq(MockInterview.createdBy, user?.primaryEmailAddress?.emailAddress)
        );

      // Process data for analytics
      const processedData = processAnalyticsData(answers, interviews);
      setAnalyticsData(processedData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (answers, interviews) => {
    // Calculate average ratings over time
    const progressData = answers
      .map((answer) => ({
        date: answer.createdAt,
        rating: parseFloat(answer.rating),
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate performance by job role
    const rolePerformance = interviews.reduce((acc, interview) => {
      const interviewAnswers = answers.filter(
        (a) => a.mockIdRef === interview.mockId
      );
      if (interviewAnswers.length === 0) return acc;

      const avgRating =
        interviewAnswers.reduce((sum, a) => sum + parseFloat(a.rating), 0) /
        interviewAnswers.length;

      acc.push({
        name: interview.jobPosition,
        value: avgRating,
      });
      return acc;
    }, []);

    // Find areas for improvement
    const improvements = answers.reduce((acc, answer) => {
      const rating = parseFloat(answer.rating);
      if (rating < 7) {
        acc.push({
          question: answer.question,
          rating,
          feedback: answer.feedback,
        });
      }
      return acc;
    }, []);

    return {
      progressData,
      rolePerformance,
      improvements,
      totalInterviews: interviews.length,
      averageRating:
        answers.reduce((sum, a) => sum + parseFloat(a.rating), 0) /
        answers.length,
    };
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary'></div>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className='container mx-auto p-6 space-y-6'>
      <h1 className='text-2xl font-bold mb-8'>{t('performanceAnalytics')}</h1>

      {/* Overview Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('totalInterviews')}
            </CardTitle>
            <Trophy className='h-4 w-4 text-yellow-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {analyticsData.totalInterviews}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>
              {t('averageRating')}
            </CardTitle>
            <Target className='h-4 w-4 text-blue-500' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {analyticsData.averageRating.toFixed(1)}/10
            </div>
          </CardContent>
        </Card>

        {/* Add more overview cards as needed */}
      </div>

      {/* Progress Over Time */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>{t('progressOverTime')}</CardTitle>
          <CardDescription>{t('ratingTrend')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-[300px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart data={analyticsData.progressData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='date' />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Line
                  type='monotone'
                  dataKey='rating'
                  stroke='#8884d8'
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance by Role */}
      <Card className='mb-8'>
        <CardHeader>
          <CardTitle>{t('performanceByRole')}</CardTitle>
          <CardDescription>{t('averageRatingByPosition')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='h-[300px]'>
            <ResponsiveContainer width='100%' height='100%'>
              <PieChart>
                <Pie
                  data={analyticsData.rolePerformance}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey='value'
                >
                  {analyticsData.rolePerformance.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Areas for Improvement */}
      <Card>
        <CardHeader>
          <CardTitle>{t('areasForImprovement')}</CardTitle>
          <CardDescription>{t('questionsNeedingWork')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            {analyticsData.improvements.slice(0, 3).map((item, index) => (
              <div key={index} className='border-b pb-4 last:border-0'>
                <div className='flex items-start gap-4'>
                  <div className='p-2 bg-red-100 rounded-full'>
                    <AlertCircle className='h-4 w-4 text-red-500' />
                  </div>
                  <div>
                    <h4 className='font-medium mb-1'>{item.question}</h4>
                    <p className='text-sm text-gray-600'>{item.feedback}</p>
                    <div className='mt-2 flex items-center gap-2'>
                      <span className='text-sm font-medium'>
                        {t('rating')}: {item.rating}/10
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// app/dashboard/interview/[interviewId]/feedback/page.jsx
'use client';
import { db } from '@/utils/db';
import { UserAnswer } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import React, { useEffect, useState } from 'react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronsUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../../../../providers/LanguageProvider';

function Feedback({ params }) {
  const { t } = useLanguage();

  const [feedbackList, setFeedbackList] = useState([]);
  const router = useRouter();
  useEffect(() => {
    GetFeedback();
  }, []);
  const GetFeedback = async () => {
    const result = await db
      .select()
      .from(UserAnswer)
      .where(eq(UserAnswer.mockIdRef, params.interviewId))
      .orderBy(UserAnswer.id);

    console.log(result);
    setFeedbackList(result);
  };

  return (
    <div className='p-10'>
      {feedbackList?.length == 0 ? (
        <h2 className='font-bold text-xl text-gray-500'>{t('noFeedback')}</h2>
      ) : (
        <>
          <h2 className='text-3xl font-bold text-green-500'>
            {t('congratulations')}
          </h2>
          <h2 className='font-bold text-2xl'>{t('hereFeedback')}</h2>

          <h2 className='text-primary text-lg my-3'>
            Your overall interview rating: <strong>7/10</strong>
          </h2>

          <h2 className='text-sm text-gray-500'>
            Find below interview question with correct answer, Your answer and
            feedback for improvement
          </h2>
          {feedbackList &&
            feedbackList.map((item, index) => (
              <Collapsible key={index} className='mt-7'>
                <CollapsibleTrigger
                  className='p-2
             bg-secondary rounded-lg flex justify-between
            my-2 text-left gap-7 w-full'
                >
                  {item.question} <ChevronsUpDown className='h-5 w-5' />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className='flex flex-col gap-2'>
                    <h2 className='text-red-500 p-2 border rounded-lg'>
                      <strong>Rating:</strong>
                      {item.rating}
                    </h2>
                    <h2 className='p-2 border rounded-lg bg-red-50 text-sm text-red-900'>
                      <strong>Your Answer: </strong>
                      {item.userAns}
                    </h2>
                    <h2 className='p-2 border rounded-lg bg-green-50 text-sm text-green-900'>
                      <strong>Correct Answer: </strong>
                      {item.correctAns}
                    </h2>
                    <h2 className='p-2 border rounded-lg bg-blue-50 text-sm text-primary'>
                      <strong>Feedback: </strong>
                      {item.feedback}
                    </h2>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
        </>
      )}

      <Button onClick={() => router.replace('/dashboard')}>Go Home</Button>
    </div>
  );
}

export default Feedback;

// app/dashboard/interview/[interviewId]/start/page.jsx
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


// app/dashboard/interview/[interviewId]/_components/QuestionsSection.jsx
import { Lightbulb, Volume2 } from 'lucide-react';
import React from 'react';
import { useLanguage } from '@/app/providers/LanguageProvider';

function QuestionsSection({ mockInterviewQuestion, activeQuestionIndex }) {
  const { t } = useLanguage();

  const textToSpeach = (text) => {
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(speech);
    } else {
      alert('Sorry, Your browser does not support text to speech');
    }
  };
  return (
    mockInterviewQuestion && (
      <div className='p-5 border rounded-lg my-10'>
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
          {mockInterviewQuestion &&
            mockInterviewQuestion.map((question, index) => (
              <h2
                className={`p-2 border rounded-full
                text-xs md:text-sm text-center cursor-pointer
                ${activeQuestionIndex == index && 'bg-primary text-white'}`}
              >
                #{index + 1}
              </h2>
            ))}
        </div>
        <h2 className='my-5 text-md md:text-lg'>
          {mockInterviewQuestion[activeQuestionIndex]?.question}
        </h2>
        <Volume2
          className='cursor-pointer'
          onClick={() =>
            textToSpeach(mockInterviewQuestion[activeQuestionIndex]?.question)
          }
        />

        <div className='border rounded-lg p-5 bg-blue-100 mt-20 '>
          <h2 className='flex gap-2 items-center text-primary'>
            <Lightbulb />
            <strong>Note:</strong>
          </h2>
          <h2 className='text-sm text-primary my-2'>
            {/* {process.env.NEXT_PUBLIC_QUESTION_NOTE} */}
            {t('questionnote')}
          </h2>
        </div>
      </div>
    )
  );
}

export default QuestionsSection;

// app/dashboard/interview/[interviewId]/_components/RecordAnswerSection.jsx
'use client';
import { Button } from '@/components/ui/button';
import React, { useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { Mic, StopCircle, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { chatSession } from '@/utils/GeminiAIModal';
import { db } from '@/utils/db';
import { UserAnswer } from '@/utils/schema';
import { useUser } from '@clerk/nextjs';
import moment from 'moment';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/app/providers/LanguageProvider';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';

function RecordAnswerSection({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
  setIsProcessing,
}) {
  const { t } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState('ko-KR');
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [finalAnswers, setFinalAnswers] = useState({});

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  const languages = [
    { code: 'ko-KR', name: '한국어' },
    { code: 'en-US', name: 'English' },
    { code: 'ja-JP', name: '日本語' },
    { code: 'zh-CN', name: '中文' },
  ];

  useEffect(() => {
    loadPreviousAnswers();
  }, [interviewData?.mockId, user]);

  const loadPreviousAnswers = async () => {
    if (!interviewData?.mockId || !user) return;

    try {
      const previousAnswers = await db
        .select()
        .from(UserAnswer)
        .where('mockIdRef', '=', interviewData.mockId)
        .where('userEmail', '=', user.primaryEmailAddress?.emailAddress);

      const answersMap = {};
      previousAnswers.forEach((answer) => {
        const index = mockInterviewQuestion.findIndex(
          (q) => q.question === answer.question
        );
        if (index !== -1) {
          answersMap[index] = answer.userAns;
        }
      });

      setFinalAnswers(answersMap);
    } catch (err) {
      console.error('Error loading previous answers:', err);
    }
  };

  const handleLanguageChange = (value) => {
    setSelectedLanguage(value);
    if (listening) {
      SpeechRecognition.stopListening();
    }
    resetTranscript();
  };

  const startRecording = () => {
    resetTranscript();
    SpeechRecognition.startListening({
      continuous: true,
      language: selectedLanguage,
    });
  };

  const stopRecording = async () => {
    SpeechRecognition.stopListening();
    if (transcript.trim()) {
      await UpdateUserAnswer();
    }
  };

  const UpdateUserAnswer = async () => {
    if (!transcript?.trim()) {
      toast.error(t('noAnswerRecorded'));
      return;
    }

    setLoading(true);
    setIsProcessing(true);

    try {
      const languageInstructions = {
        'ko-KR': '피드백을 한국어로 제공해주세요',
        'en-US': 'Provide feedback in English',
        'ja-JP': 'フィードバックを日本語で提供してください',
        'zh-CN': '请用中文提供反馈',
      };

      const feedbackPrompt = `
        Question: ${mockInterviewQuestion[activeQuestionIndex]?.question}
        User Answer: ${transcript}
        ${languageInstructions[selectedLanguage]}
        Please provide rating and feedback for this interview answer in JSON format with 'rating' and 'feedback' fields, focusing on areas of improvement in 3-5 lines.
      `;

      const result = await chatSession.sendMessage(feedbackPrompt);
      const mockJsonResp = result.response
        .text()
        .replace('```json', '')
        .replace('```', '')
        .trim();

      const JsonFeedbackResp = JSON.parse(mockJsonResp);

      const resp = await db.insert(UserAnswer).values({
        mockIdRef: interviewData?.mockId,
        question: mockInterviewQuestion[activeQuestionIndex]?.question,
        correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
        userAns: transcript,
        feedback: JsonFeedbackResp?.feedback,
        rating: JsonFeedbackResp?.rating,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format('DD-MM-yyyy'),
        language: selectedLanguage,
      });

      if (resp) {
        setFinalAnswers((prev) => ({
          ...prev,
          [activeQuestionIndex]: transcript,
        }));
        toast.success(t('answerRecorded'));
        resetTranscript();
      }
    } catch (err) {
      toast.error(t('updateAnswerError'));
    } finally {
      setLoading(false);
      setIsProcessing(false);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <div className='text-center p-4'>{t('browserNotSupported')}</div>;
  }

  if (!isMicrophoneAvailable) {
    return <div className='text-center p-4'>{t('microphoneNotAvailable')}</div>;
  }

  return (
    <div className='flex items-center justify-center flex-col'>
      <div className='flex flex-col gap-4 w-full max-w-xl mb-6'>
        <div className='flex justify-between items-center'>
          <h3 className='text-lg font-medium'>{t('recordingSettings')}</h3>
          <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
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
      </div>

      <div className='relative flex flex-col items-center bg-black rounded-lg p-5'>
        <Webcam
          mirrored={true}
          className='z-10 rounded-lg'
          style={{ width: 500 }}
          audio={false}
        />
      </div>

      <Button
        disabled={loading}
        variant='outline'
        className='my-10'
        onClick={listening ? stopRecording : startRecording}
      >
        {listening ? (
          <span className='text-red-600 animate-pulse flex gap-2 items-center'>
            <StopCircle />
            {t('stopRecording')}
          </span>
        ) : (
          <span className='text-primary flex gap-2 items-center'>
            <Mic />
            {t('startRecording')}
          </span>
        )}
      </Button>

      {/* Current Transcription */}
      <div className='w-full max-w-xl p-4 bg-gray-50 rounded-lg mb-4'>
        <h4 className='font-medium mb-2'>{t('currentTranscription')}</h4>
        <p className='text-gray-700 whitespace-pre-wrap'>
          {transcript || t('noTranscriptYet')}
        </p>
      </div>

      {/* Final Answer */}
      <div className='w-full max-w-xl p-4 bg-gray-50 rounded-lg'>
        <h4 className='font-medium mb-2 flex items-center gap-2'>
          {t('finalAnswer')}
          {finalAnswers[activeQuestionIndex] && (
            <span className='text-xs bg-green-100 text-green-800 px-2 py-1 rounded'>
              {t('submitted')}
            </span>
          )}
        </h4>
        <p className='text-gray-700 whitespace-pre-wrap'>
          {finalAnswers[activeQuestionIndex] || t('noAnswerYet')}
        </p>
      </div>
    </div>
  );
}

export default RecordAnswerSection;

// app/dashboard/interview/[interviewId]/page.jsx

'use client';
import { Button } from '@/components/ui/button';
import { db } from '@/utils/db';
import { MockInterview } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { Lightbulb, WebcamIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { useLanguage } from '@/app/providers/LanguageProvider';
function Interview({ params }) {
  const { t } = useLanguage();

  const [interviewData, setInterviewData] = useState();
  const [webCamEnabled, setWebCamEnabled] = useState();
  useEffect(() => {
    console.log(params.interviewId);
    GetInterviewDetails();
  }, []);

  /**
   * Used to Get Interview Details by MockId/Interview Id
   */
  const GetInterviewDetails = async () => {
    const result = await db
      .select()
      .from(MockInterview)
      .where(eq(MockInterview.mockId, params.interviewId));

    setInterviewData(result[0]);
  };

  return (
    <div className='my-10'>
      <h2 className='font-bold text-2xl'>{t('letsGetStarted')}</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
        <div className='flex flex-col my-5 gap-5'>
          <div className='flex flex-col p-5 rounded-lg border gap-5'>
            <h2 className='text-lg'>
              <strong>{t('jobRolePosition')}:</strong>
              {interviewData?.jobPosition}{' '}
            </h2>
            <h2 className='text-lg'>
              <strong>{t('jobDescTechStack')}:</strong>
              {interviewData?.jobDesc}{' '}
            </h2>
            <h2 className='text-lg'>
              <strong>{t('yearsOfExperience')}:</strong>
              {interviewData?.jobExperience}{' '}
            </h2>
          </div>
          <div className='p-5 border rounded-lg border-yellow-300 bg-yellow-100'>
            <h2 className='flex gap-2 items-center text-yellow-500'>
              <Lightbulb />
              <strong>{t('information')}</strong>
            </h2>
            <h2 className='mt-3 text-yellow-500'>
              {/* {process.env.NEXT_PUBLIC_INFORMATION} */}
              {t('startinterviewinfo')}
            </h2>
          </div>
        </div>
        <div>
          {webCamEnabled ? (
            <Webcam
              onUserMedia={() => setWebCamEnabled(true)}
              onUserMediaError={() => setWebCamEnabled(false)}
              mirrored={true}
              style={{
                height: 300,
                width: 300,
              }}
            />
          ) : (
            <>
              <WebcamIcon className='h-72 w-full my-7 p-20 bg-secondary rounded-lg border' />
              <Button
                variant='ghost'
                className='w-full'
                onClick={() => setWebCamEnabled(true)}
              >
                {t('enableWebcam')}
              </Button>
            </>
          )}
        </div>
      </div>
      <div className='flex justify-end items-end'>
        <Link href={'/dashboard/interview/' + params.interviewId + '/start'}>
          <Button>{t('startInterview')}</Button>
        </Link>
      </div>
    </div>
  );
}

export default Interview;


// app/dashboard/questions/page.jsx
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



// app/how/page.jsx
'use client';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { Lightbulb, Video, Mic, Brain, BarChart } from 'lucide-react';
import Header from '../dashboard/_components/Header';
import Footer from '../dashboard/_components/Footer';
import Head from 'next/head';

export default function HowItWorks() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: <Lightbulb className='w-8 h-8 text-primary' />,
      title: t('step1Title'),
      description: t('step1Description'),
    },
    {
      icon: <Video className='w-8 h-8 text-primary' />,
      title: t('step2Title'),
      description: t('step2Description'),
    },
    {
      icon: <Mic className='w-8 h-8 text-primary' />,
      title: t('step3Title'),
      description: t('step3Description'),
    },
    {
      icon: <Brain className='w-8 h-8 text-primary' />,
      title: t('step4Title'),
      description: t('step4Description'),
    },
    {
      icon: <BarChart className='w-8 h-8 text-primary' />,
      title: t('step5Title'),
      description: t('step5Description'),
    },
  ];

  return (
    <div>
      <Header />
      <div className='container mx-auto px-4 py-12 max-w-6xl'>
        <div className='text-center mb-16'>
          <h1 className='text-4xl font-bold mb-4'>{t('howItWorksTitle')}</h1>
          <p className='text-xl text-gray-600'>{t('howItWorksSubtitle')}</p>
        </div>

        <div className='space-y-12'>
          {steps.map((step, index) => (
            <div
              key={index}
              className='flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow'
            >
              <div className='p-4 bg-gray-50 rounded-full'>{step.icon}</div>
              <div>
                <h2 className='text-xl font-semibold mb-2'>{step.title}</h2>
                <p className='text-gray-600'>{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className='mt-16 text-center bg-gray-50 p-8 rounded-lg'>
          <h2 className='text-2xl font-bold mb-4'>{t('readyToStart')}</h2>
          <p className='text-gray-600 mb-6'>{t('readyToStartDescription')}</p>
          <a
            href='/dashboard'
            className='inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors'
          >
            {t('startPracticing')}
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}


// app/providers/LanguageProvider.js
'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const translations = {
  en: {
    dashboard: 'Dashboard',
    analytics: 'Analytics',
    createInterview: 'Create and Start your AI Mockup Interview',
    questions: 'Questions',
    upgrade: 'Upgrade',
    howItWorks: 'How it Works?',
    addNew: '+ Add New',
    jobRole: 'Job Role/Job Position',
    jobDesc: 'Job Description/Tech Stack (In Short)',
    yearsExp: 'Years of experience',
    cancel: 'Cancel',
    startInterview: 'Start Interview',
    generating: 'Generating from AI',

    // Existing translations...
    newInterview: '+ Add New',
    jobRolePosition: 'Job Role/Job Position',
    jobDescTech: 'Job Description/Tech Stack (In Short)',
    yearsExperience: 'Years of Experience',
    tellMore: 'Tell us more about your job interview',
    languageSelect: 'Question Language',
    cancel: 'Cancel',
    startInterview: 'Start Interview',
    generatingAi: 'Generating from AI',

    // Interview Item Card
    yearsExp: 'Years of Experience',
    createdAt: 'Created At:',
    feedback: 'Feedback',
    start: 'Start',

    // Interview List
    previousMock: 'Previous Mock Interview',

    // Feedback Page
    noFeedback: 'No Interview Feedback Record Found',
    congratulations: 'Congratulations!',
    hereFeedback: 'Here is your interview feedback',
    overallRating: 'Your overall interview rating:',
    findBelow:
      'Find below interview question with correct answer, Your answer and feedback for improvement',
    rating: 'Rating:',
    yourAnswer: 'Your Answer:',
    correctAnswer: 'Correct Answer:',
    feedbackLabel: 'Feedback:',
    goHome: 'Go Home',

    // Start Interview
    previousQuestion: 'Previous Question',
    nextQuestion: 'Next Question',
    endInterview: 'End Interview',

    // AddNewInterview
    addNew: '+ Add New',
    tellMore: 'Tell us more about your job interview',
    questionLanguage: 'Question Language',
    jobRole: 'Job Role/Job Position',
    jobRolePlaceholder: 'Ex. Full Stack Developer',
    jobDesc: 'Job Description/Tech Stack (In Short)',
    jobDescPlaceholder: 'Ex. React, Angular, NodeJs, MySQL etc',
    yearsExp: 'Years of experience',
    yearsExpPlaceholder: 'Ex. 5',
    cancel: 'Cancel',
    startInterview: 'Start Interview',
    generatingAI: 'Generating from AI',

    // QuestionsSection
    question: 'Question #',
    note: 'Note:',
    recordingSettings: 'Recording Reply Language Settings',
    transcription: 'Transcription:',
    recordingStart: 'Start Recording',
    recordingStop: 'Stop',
    noAnswerRecorded: 'No answer recorded',
    answerRecorded: 'Answer recorded successfully',
    failedRecord: 'Failed to record answer',

    // Home Page
    title: 'AI Job Interview Practice Helper',
    subtitle: 'Practice with AI interviews to increase your employment rate!',
    getStarted: 'Get Started',

    // Start Interview Page
    previousQuestion: 'Previous Question',
    nextQuestion: 'Next Question',
    endInterview: 'End Interview',
    failedToStartRecording: 'Failed to start recording',
    failedToStopRecording: 'Failed to stop recording',
    browserNotSupported: 'Sorry, Your browser does not support text to speech',

    // Interview List
    previousMockInterviews: 'Previous Mock Interviews',
    noInterviewsYet: 'No interviews yet',
    createdAt: 'Created At: ',
    yearsOfExperience: 'Years of Experience',

    // Toast Messages
    errorRecording: 'Error recording answer',
    successRecording: 'Successfully recorded answer',
    errorGenerating: 'Error generating interview',

    // Error Messages
    webcamError: 'Error accessing webcam',
    microphoneError: 'Error accessing microphone',
    generalError: 'An error occurred',

    // ... existing translations ...
    letsGetStarted: "Let's Get Started",
    jobRolePosition: 'Job Role/Job Position',
    jobDescTechStack: 'Job Description/Tech Stack',
    yearsOfExperience: 'Years of Experience',
    information: 'Information',
    enableWebcam: 'Enable Web Cam and Microphone',
    startInterview: 'Start Interview',

    allQuestions: 'All Questions',
    noInterviewsYet: 'No interviews yet. Create one to see questions here.',
    yearsExp: 'years of experience',
    suggestedAnswer: 'Suggested Answer',

    howItWorksTitle: 'How AI Interview Practice Works',
    howItWorksSubtitle:
      'Master your interview skills with our AI-powered practice platform',

    step1Title: 'Create Your Interview',
    step1Description:
      'Select your job position, describe your desired role, and specify your experience level. Our AI will generate relevant interview questions tailored to your profile.',

    step2Title: 'Prepare Your Setup',
    step2Description:
      'Enable your webcam and microphone to create a realistic interview environment. Practice your body language and verbal communication just like in a real interview.',

    step3Title: 'Answer Questions',
    step3Description:
      'Respond to interview questions naturally in your preferred language. Our speech-to-text technology accurately captures your responses for analysis.',

    step4Title: 'Get AI Feedback',
    step4Description:
      'Receive immediate, detailed feedback on your answers from our AI. Learn what you did well and where you can improve.',

    step5Title: 'Track Progress',
    step5Description:
      'Review your interview history, track your improvement over time, and practice specific areas that need attention.',

    readyToStart: 'Ready to Start Practicing?',
    readyToStartDescription:
      'Begin your journey to interview success with AI-powered practice sessions.',
    startPracticing: 'Start Practicing Now',

    noInterviewsYet: 'No interviews yet',
    createFirstInterview: 'Create your first interview to get started',

    performanceAnalytics: 'Performance Analytics',
    totalInterviews: 'Total Interviews',
    averageRating: 'Average Rating',
    progressOverTime: 'Progress Over Time',
    ratingTrend: 'Your rating trend across all interviews',
    performanceByRole: 'Performance by Role',
    averageRatingByPosition: 'Average rating for each job position',
    areasForImprovement: 'Areas for Improvement',
    questionsNeedingWork: 'Questions that need more practice',
    rating: 'Rating',

    questionBank: 'Practice Question Bank',
    questionBankDescription: 'Browse and practice common interview questions',
    savedQuestions: 'Saved Questions',
    behavioural: 'Behavioural',
    technical: 'Technical',
    situational: 'Situational',
    practiceQuestion: 'Practice Question',
    prepareYourAnswer: 'Take your time to prepare a structured answer',
    sampleAnswer: 'Sample Answer',
    tips: 'Tips',
    commonFor: 'Common for Roles',
    questionSaved: 'Question saved to your collection',
    questionRemoved: 'Question removed from your collection',

    microphonePermissionDenied:
      'Microphone permission denied. Please allow access to record.',
    browserNotSupported: 'Your browser does not support speech recognition.',
    recordingError: 'Error occurred while recording. Please try again.',
    processing: 'Processing...',
    startRecording: 'Start Recording',
    stopRecording: 'Stop Recording',

    companyName: 'AI-Interview',
    companyDescription:
      'AI-powered interview practice platform to help you succeed in your career journey.',
    quickLinks: 'Quick Links',
    legal: 'Legal',
    termsOfService: 'Terms of Service',
    privacyPolicy: 'Privacy Policy',
    cookiePolicy: 'Cookie Policy',
    businessHours: 'Business Hours',
    allRightsReserved: 'All rights reserved',

    recordingError: 'Error occurred while recording',
    recordingStopError: 'Error stopping recording',
    noAnswerRecorded: 'No answer recorded',
    answerRecorded: 'Answer recorded successfully',
    updateAnswerError: 'Failed to update answer',
    noTranscriptYet: 'Transcript will appear here when you start speaking...',
    selectLanguage: 'Select Language',

    currentTranscription: 'Current Transcription',
    finalAnswer: 'Final Answer',
    noTranscriptYet: 'Start speaking to see transcription...',
    noAnswerYet: 'No answer submitted yet for this question',
    submitted: 'Submitted',

    questionnote:
      "Please allow audio usage in your phone or browser settings first. To respond, please press the 'Start Recording' button first.",
    startinterviewinfo:
      "Please allow access to your browser's webcam and microphone. You will be presented with 5 questions.",

    credits: 'Credits',
    nextCredit: 'Next Credit In',
    noCredits: 'No credits available',
    waitForCredits: 'Please wait for credits to refresh',
  },
  ko: {
    dashboard: '대시보드',
    analytics: '분석',
    createInterview: '새로운 면접을 만들어보세요',
    questions: '질문',
    upgrade: '업그레이드',
    howItWorks: '사용 방법',
    addNew: '+ 새로 만들기',
    jobRole: '직책/직위',
    jobDesc: '직무 설명/기술 스택 (간단히)',
    yearsExp: '경력',
    cancel: '취소',
    startInterview: '면접 시작',
    generating: 'AI가 생성 중입니다',
    newInterview: '+ 새로 만들기',
    jobRolePosition: '직책/직위',
    jobDescTech: '직무 설명/기술 스택 (간단히)',
    yearsExperience: '경력',
    tellMore: '면접에 대해 자세히 알려주세요',
    languageSelect: '질문 언어',
    cancel: '취소',
    startInterview: '면접 시작',
    generatingAi: 'AI가 생성 중입니다',

    // Interview Item Card
    yearsExp: '년 경력',
    createdAt: '생성일:',
    feedback: '피드백',
    start: '시작',

    // Interview List
    previousMock: '이전 모의 면접',

    // Feedback Page
    noFeedback: '면접 피드백 기록을 찾을 수 없습니다',
    congratulations: '축하합니다!',
    hereFeedback: '면접 피드백입니다',
    overallRating: '전체 면접 평가:',
    findBelow:
      '아래에서 면접 질문과 정답, 답변, 개선을 위한 피드백을 확인하세요',
    rating: '평가:',
    yourAnswer: '당신의 답변:',
    correctAnswer: '정답:',
    feedbackLabel: '피드백:',
    goHome: '홈으로',

    // Start Interview
    previousQuestion: '이전 질문',
    nextQuestion: '다음 질문',
    endInterview: '면접 종료',

    // AddNewInterview
    addNew: '+ 새로 만들기',
    tellMore: '면접에 대해 자세히 알려주세요',
    questionLanguage: '질문 언어',
    jobRole: '직책/직위',
    jobRolePlaceholder: '예시: 풀스택 개발자',
    jobDesc: '직무 설명/기술 스택 (간단히)',
    jobDescPlaceholder: '예시: React, Angular, NodeJs, MySQL 등',
    yearsExp: '경력',
    yearsExpPlaceholder: '예시: 5',
    cancel: '취소',
    startInterview: '면접 시작',
    generatingAI: 'AI가 생성 중입니다',

    // QuestionsSection
    question: '질문 #',
    note: '참고:',
    recordingSettings: '녹음 답변 언어설정',
    transcription: '답변 내용:',
    recordingStart: '녹화 시작',
    recordingStop: '멈추기',
    noAnswerRecorded: '녹음된 답변이 없습니다',
    answerRecorded: '답변이 성공적으로 저장되었습니다',
    failedRecord: '답변 저장에 실패했습니다',

    // Home Page
    title: 'AI 취업 면접 연습 도우미',
    subtitle: 'AI 면접으로 연습해서 취업률을 높여보세요!',
    getStarted: '시작하기',

    // Start Interview Page
    previousQuestion: '이전 질문',
    nextQuestion: '다음 질문',
    endInterview: '면접 종료',
    failedToStartRecording: '녹화 시작 실패',
    failedToStopRecording: '녹화 중지 실패',
    browserNotSupported: '죄송합니다. 브라우저가 음성 지원을 지원하지 않습니다',

    // Interview List
    previousMockInterviews: '이전 모의 면접',
    noInterviewsYet: '아직 면접이 없습니다',
    createdAt: '생성일: ',
    yearsOfExperience: '년 경력',

    // Toast Messages
    errorRecording: '답변 녹음 오류',
    successRecording: '답변이 성공적으로 녹음되었습니다',
    errorGenerating: '면접 생성 오류',

    // Error Messages
    webcamError: '웹캠 접근 오류',
    microphoneError: '마이크 접근 오류',
    generalError: '오류가 발생했습니다',

    letsGetStarted: '시작하겠습니다',
    jobRolePosition: '직책/직위',
    jobDescTechStack: '직무 설명/기술 스택',
    yearsOfExperience: '경력',
    information: '안내',
    enableWebcam: '웹캠과 마이크 활성화',
    startInterview: '면접 시작',

    allQuestions: '모든 질문',
    noInterviewsYet: '아직 면접이 없습니다. 면접을 생성하여 질문을 확인하세요.',
    yearsExp: '년 경력',
    suggestedAnswer: '추천 답변',

    howItWorksTitle: 'AI 면접 연습 사용방법',
    howItWorksSubtitle: 'AI 기반 연습 플랫폼으로 면접 실력을 향상시키세요',

    step1Title: '면접 생성하기',
    step1Description:
      '직무, 희망하는 역할, 경력 수준을 선택하세요. AI가 귀하의 프로필에 맞는 면접 질문을 생성합니다.',

    step2Title: '환경 설정하기',
    step2Description:
      '실제 면접과 같은 환경을 만들기 위해 웹캠과 마이크를 활성화하세요. 실제 면접처럼 바디랭귀지와 언어 표현을 연습하세요.',

    step3Title: '질문 답변하기',
    step3Description:
      '선호하는 언어로 면접 질문에 자연스럽게 답변하세요. 음성 인식 기술이 답변을 정확하게 기록합니다.',

    step4Title: 'AI 피드백 받기',
    step4Description:
      'AI로부터 답변에 대한 즉각적이고 상세한 피드백을 받으세요. 잘한 점과 개선할 점을 파악하세요.',

    step5Title: '진행 상황 확인하기',
    step5Description:
      '면접 기록을 검토하고, 시간에 따른 향상도를 추적하며, 개선이 필요한 특정 영역을 연습하세요.',

    readyToStart: '연습을 시작할 준비가 되셨나요?',
    readyToStartDescription:
      'AI 기반 연습 세션으로 성공적인 면접을 향한 여정을 시작하세요.',
    startPracticing: '지금 연습 시작하기',

    noInterviewsYet: '아직 면접이 없습니다',
    createFirstInterview: '첫 면접을 생성하여 시작하세요',

    performanceAnalytics: '성과 분석',
    totalInterviews: '전체 면접 수',
    averageRating: '평균 평가',
    progressOverTime: '시간별 진행 상황',
    ratingTrend: '모든 면접에 대한 평가 추이',
    performanceByRole: '직무별 성과',
    averageRatingByPosition: '각 직무별 평균 평가',
    areasForImprovement: '개선이 필요한 영역',
    questionsNeedingWork: '더 많은 연습이 필요한 질문들',
    rating: '평가',

    questionBank: '면접 질문 은행',
    questionBankDescription: '일반적인 면접 질문을 찾아보고 연습하세요',
    savedQuestions: '저장된 질문',
    behavioural: '행동',
    technical: '기술',
    situational: '상황',
    practiceQuestion: '질문 연습',
    prepareYourAnswer: '구조화된 답변을 준비하세요',
    sampleAnswer: '예시 답변',
    tips: '팁',
    commonFor: '일반적인 직무',
    questionSaved: '질문이 저장되었습니다',
    questionRemoved: '질문이 삭제되었습니다',

    microphonePermissionDenied:
      '마이크 권한이 거부되었습니다. 녹음을 위해 접근을 허용해주세요.',
    browserNotSupported: '현재 브라우저에서 음성 인식을 지원하지 않습니다.',
    recordingError: '녹음 중 오류가 발생했습니다. 다시 시도해주세요.',
    processing: '처리 중...',
    startRecording: '녹화 시작',
    stopRecording: '멈추기',

    companyName: 'AI-Interview',
    companyDescription:
      'AI 기반 면접 연습 플랫폼으로 여러분의 커리어 여정을 돕습니다.',
    quickLinks: '빠른 링크',
    legal: '법적 고지',
    termsOfService: '이용약관',
    privacyPolicy: '개인정보처리방침',
    cookiePolicy: '쿠키 정책',
    businessHours: '운영시간',
    allRightsReserved: '모든 권리 보유',

    recordingError: '녹음 중 오류가 발생했습니다',
    recordingStopError: '녹음 중지 중 오류가 발생했습니다',
    noAnswerRecorded: '녹음된 답변이 없습니다',
    answerRecorded: '답변이 성공적으로 저장되었습니다',
    updateAnswerError: '답변 업데이트 실패',
    noTranscriptYet: '말씀하시면 여기에 텍스트가 나타납니다...',
    selectLanguage: '언어 선택',

    currentTranscription: '현재 답변',
    finalAnswer: '최종 답변',
    noTranscriptYet: '말씀하시면 텍스트가 표시됩니다...',
    noAnswerYet: '이 질문에 대한 제출된 답변이 없습니다',
    submitted: '제출됨',

    questionnote:
      "핸드폰이나 브라우저 설정에서 오디오 사용 허가를 먼저 해주세요. 답하시려면 '녹화 시작' 버튼을 먼저 눌러주세요",
    startinterviewinfo:
      '브라우저 웹캠과 오디오 사용 권한을 허락해주세요. 5개의 질문이 제공됩니다. ',
    credits: '크레딧',
    nextCredit: '다음 크레딧까지',
    noCredits: '크레딧이 없습니다',
    waitForCredits: '크레딧이 충전될 때까지 기다려주세요',
  },
};

// const LanguageContext = createContext();

// export function LanguageProvider({ children }) {
//   const [language, setLanguage] = useState('en');

//   useEffect(() => {
//     // // Try to get user's location/language
//     // const userLang = navigator.language || navigator.userLanguage;
//     // // If Korean, set to Korean, otherwise default to English
//     // setLanguage(userLang.startsWith('ko') ? 'ko' : 'en');
//     const savedLanguage = localStorage.getItem('preferred-language');
//     if (savedLanguage) {
//       setLanguage(savedLanguage);
//     } else {
//       // If no saved preference, check browser language
//       const browserLang = navigator.language;
//       setLanguage(browserLang.startsWith('ko') ? 'ko' : 'en');
//     }
//   }, []);

//   const savedLanguage = localStorage.getItem('preferred-language');
//   if (savedLanguage) {
//     setLanguage(savedLanguage);
//   } else {
//     // If no saved preference, check browser language
//     const browserLang = navigator.language;
//     setLanguage(browserLang.startsWith('ko') ? 'ko' : 'en');
//   }

//   // Save language preference whenever it changes
//   const handleSetLanguage = (newLang) => {
//     setLanguage(newLang);
//     localStorage.setItem('preferred-language', newLang);
//   };

//   const t = (key) => translations[language]?.[key] || translations.en[key];

//   return (
//     <LanguageContext.Provider
//       value={{ language, setLanguage: handleSetLanguage, t }}
//     >
//       {children}
//     </LanguageContext.Provider>
//   );
// }

// export const useLanguage = () => useContext(LanguageContext);

export const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [mounted, setMounted] = useState(false);

  // // Load language preference on mount
  // useEffect(() => {
  //   const savedLanguage = localStorage.getItem('preferred-language');
  //   if (savedLanguage) {
  //     setLanguage(savedLanguage);
  //   } else {
  //     // If no saved preference, check browser language
  //     const browserLang = navigator.language;
  //     setLanguage(browserLang.startsWith('ko') ? 'ko' : 'en');
  //   }
  // }, []);
  // Only run this effect on client-side
  useEffect(() => {
    setMounted(true);
    const savedLanguage = window?.localStorage?.getItem('preferred-language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    } else {
      // If no saved preference, check browser language
      const browserLang = window?.navigator?.language;
      setLanguage(browserLang?.startsWith('ko') ? 'ko' : 'en');
    }
  }, []);

  // // Save language preference whenever it changes
  // const handleSetLanguage = (newLang) => {
  //   setLanguage(newLang);
  //   localStorage.setItem('preferred-language', newLang);
  // };

  // Only save to localStorage on client-side
  const handleSetLanguage = (newLang) => {
    setLanguage(newLang);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('preferred-language', newLang);
    }
  };

  // Don't render children until mounted (client-side)
  if (!mounted) {
    return null; // or a loading spinner
  }

  const t = (key) => translations[language]?.[key] || translations.en[key];

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};



// app/providers/Providers.js
'use client';
import { ClerkProvider } from '@clerk/nextjs';
import { useLanguage } from './LanguageProvider';
import { koKR } from '@clerk/localizations';

export function Providers({ children }) {
  const { language } = useLanguage();
  console.log(language);

  const clerkLocalization = {
    ko: {
      socialButtonsBlockButton: {
        sign_in_with_google: 'Google로 계속하기',
      },
      formFieldLabel__emailAddress: '이메일',
      formFieldLabel__password: '비밀번호',
      formButtonPrimary: '계속하기',
      signIn: {
        start: {
          title: 'AI-Interview에 로그인',
          subtitle: '계속하려면 로그인하세요',
          actionText: '계정이 없으신가요?',
          actionLink: '가입하기',
        },
      },
      dividerText: '또는',
      signIn: {
        start: {
          title: 'AI-Interview에 로그인',
          subtitle: '계속하려면 로그인하세요',
          actionText: '계정이 없으신가요?',
          actionLink: '가입하기',
          emailPlaceholder: '이메일 주소를 입력하세요',
          emailInputLabel: '이메일 주소',
          continueButton: '계속하기',
        },
        password: {
          title: '비밀번호를 입력하세요',
          subtitle: '계정 보안을 위해 비밀번호를 입력해주세요',
          placeholder: '비밀번호',
          forgotPasswordText: '비밀번호를 잊으셨나요?',
          actionText: '비밀번호를 잊으셨나요?',
          actionLink: '재설정',
          backButton: '뒤로',
          continueButton: '계속하기',
        },
        forgotPassword: {
          title: '비밀번호 재설정',
          subtitle: '이메일로 재설정 링크를 보내드립니다',
          formTitle: '비밀번호 재설정',
          formSubtitle: '비밀번호 재설정 링크를 보내드립니다',
          submitButton: '재설정 링크 보내기',
          backButton: '로그인으로 돌아가기',
        },
        factors: {
          backButton: '뒤로',
          title: '인증',
          subtitle: '계정 보안을 위해 인증을 진행해주세요',
        },
      },
      signUp: {
        start: {
          title: '계정 만들기',
          subtitle: 'AI-Interview를 시작하세요',
          actionText: '이미 계정이 있으신가요?',
          actionLink: '로그인',
          emailPlaceholder: '이메일 주소를 입력하세요',
          emailInputLabel: '이메일 주소',
          continueButton: '계속하기',
        },
        password: {
          title: '비밀번호 설정',
          subtitle: '안전한 비밀번호를 설정해주세요',
          placeholder: '비밀번호',
          confirmPlaceholder: '비밀번호 확인',
          backButton: '뒤로',
          continueButton: '계속하기',
        },
      },
      userButton: {
        action__manage_account: '계정 관리',
        action__sign_out: '로그아웃',
        action__sign_in: '로그인',
        action__sign_up: '가입하기',
      },
      socialButtonsBlockButton: {
        sign_in_with_google: 'Google로 계속하기',
      },
      formFieldLabel__emailAddress: '이메일 주소',
      formFieldLabel__password: '비밀번호',
      formFieldLabel__confirmPassword: '비밀번호 확인',
      formButtonPrimary: '계속하기',
      dividerText: '또는',
      footerActionLink__useAnotherMethod: '다른 방법으로 계속하기',
      signIn: {
        email: {
          title: '이메일 주소 입력',
          subtitle: '계정에 로그인하기 위한 이메일을 입력하세요',
        },
      },
    },
  };

  return (
    <ClerkProvider
      localization={language === 'ko' ? koKR : undefined}
      locale={language === 'ko' ? 'ko-KR' : 'en-US'} // Add this line
      appearance={{
        variables: {
          colorPrimary: language === 'ko' ? '#000' : undefined,
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}

// app/terms/page.jsx
// app/terms/page.jsx
'use client';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { termsContent } from '@/utils/terms-content';
import Header from '../dashboard/_components/Header';
import Footer from '../dashboard/_components/Footer';
export default function Terms() {
  const { language } = useLanguage();
  const content = termsContent[language];

  return (
    <div>
      <Header />
      <div className='container mx-auto px-4 py-8 max-w-4xl'>
        <h1 className='text-3xl font-bold mb-2'>{content.title}</h1>
        <p className='text-gray-500 mb-8'>{content.lastUpdated}</p>

        <div className='space-y-8'>
          {content.sections.map((section, index) => (
            <div key={index} className='prose'>
              <h2 className='text-xl font-semibold mb-3'>{section.title}</h2>
              <p className='text-gray-700 whitespace-pre-wrap'>
                {section.content}
              </p>
            </div>
          ))}

          <div className='border-t pt-8 mt-12'>
            <h2 className='text-xl font-semibold mb-3'>
              {content.contact.title}
            </h2>
            <p className='text-gray-700 mb-4'>{content.contact.content}</p>
            <div className='bg-gray-50 p-4 rounded-lg'>
              <p>Email: whd793@gmail.com</p>
              {/* <p>Address: Your Business Address</p> */}
              {/* <p>Phone: Your Business Phone</p> */}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// app/layout.js
import { Outfit } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { Toaster } from '@/components/ui/sonner';
// app/layout.js
import { LanguageProvider } from './providers/LanguageProvider';
// import { useLanguage } from '@/providers/LanguageProvider';
import { Providers } from './providers/Providers';

const inter = Outfit({ subsets: ['latin'] });

export const metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({ children }) {
  // const { language } = useLanguage();

  // const clerkLocalization = {
  //   ko: {
  //     signIn: {
  //       start: {
  //         title: '로그인',
  //         subtitle: '계정에 로그인하세요',
  //         actionText: '계정이 없으신가요?',
  //         actionLink: '가입하기',
  //       },
  //       password: {
  //         title: '비밀번호를 입력하세요',
  //         placeholder: '비밀번호',
  //         actionText: '비밀번호를 잊으셨나요?',
  //         actionLink: '재설정',
  //       },
  //     },
  //     userButton: {
  //       action__manage_account: '계정 관리',
  //       action__sign_out: '로그아웃',
  //       action__sign_in: '로그인',
  //       action__sign_up: '가입하기',
  //     },
  //   },
  //   // Add other languages as needed
  // };

  return (
    <html>
      <body>
        {/* <ClerkProvider localization={clerkLocalization[language]}> */}
        <LanguageProvider>
          <Providers>
            {children}

            <Toaster position='top-center' />
          </Providers>
        </LanguageProvider>
        {/* </ClerkProvider> */}
      </body>
    </html>

    // <LanguageProvider>
    //   <ClerkProvider>
    //     <html lang='en'>
    //       <body className={inter.className}>
    //         <Toaster />
    //         {children}
    //       </body>
    //     </html>
    //   </ClerkProvider>
    // </LanguageProvider>
  );
}


// app/page.js
// app/page.js
'use client';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Header from './dashboard/_components/Header';
import Footer from './dashboard/_components/Footer';
import { Lightbulb, Video, Mic, Brain, BarChart } from 'lucide-react';

// import { useLanguage } from '@/contexts/LanguageContext';
import { useLanguage } from './providers/LanguageProvider';
export default function Home() {
  const { t } = useLanguage();

  const steps = [
    {
      icon: <Lightbulb className='w-8 h-8 text-primary' />,
      title: t('step1Title'),
      description: t('step1Description'),
    },
    {
      icon: <Video className='w-8 h-8 text-primary' />,
      title: t('step2Title'),
      description: t('step2Description'),
    },
    {
      icon: <Mic className='w-8 h-8 text-primary' />,
      title: t('step3Title'),
      description: t('step3Description'),
    },
    {
      icon: <Brain className='w-8 h-8 text-primary' />,
      title: t('step4Title'),
      description: t('step4Description'),
    },
    {
      icon: <BarChart className='w-8 h-8 text-primary' />,
      title: t('step5Title'),
      description: t('step5Description'),
    },
  ];

  return (
    <div className='relative min-h-screen overflow-hidden'>
      {/* Background image with fixed positioning */}
      <div className='fixed inset-0'>
        <img
          alt=''
          src='/images/inv.jpg'
          className='h-full w-full object-cover brightness-[40%]'
        />
      </div>

      {/* Content */}
      <div className='relative z-10'>
        <Header />
        <section>
          <div className='pt-32 px-4 mx-auto max-w-screen-xl text-center lg:pt-32 lg:px-12'>
            <h1 className='mb-4 text-4xl font-extrabold tracking-tight leading-none text-white md:text-5xl lg:text-6xl'>
              {t('title')}
            </h1>
            <p className='mb-8 text-lg font-normal text-gray-100 lg:text-xl sm:px-16 xl:px-48'>
              {t('subtitle')}
            </p>
            <div className='flex mb-8 lg:mb-16 space-y-4 flex-row justify-center space-x-4'>
              <a
                href='/dashboard'
                className='inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-primary hover:bg-primary hover:ring-4 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900'
              >
                {t('getStarted')}
                <svg
                  className='ml-2 -mr-1 w-5 h-5'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    fillRule='evenodd'
                    d='M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              </a>
            </div>
          </div>
          <div className='px-4 mx-auto mb-20 text-center md:max-w-screen-md lg:max-w-screen-lg lg:px-36'>
            <span className='font-semibold text-gray-400 uppercase'>
              FEATURED IN
            </span>
            <div className='flex flex-wrap justify-center items-center mt-8 text-gray-500 sm:justify-between'>
              <a
                href='#'
                className='mr-5 mb-5 lg:mb-0 hover:text-gray-800 dark:hover:text-gray-400'
              >
                <svg
                  className='h-8'
                  viewBox='0 0 132 29'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M39.4555 5.17846C38.9976 3.47767 37.6566 2.13667 35.9558 1.67876C32.8486 0.828369 20.4198 0.828369 20.4198 0.828369C20.4198 0.828369 7.99099 0.828369 4.88379 1.64606C3.21571 2.10396 1.842 3.47767 1.38409 5.17846C0.566406 8.28567 0.566406 14.729 0.566406 14.729C0.566406 14.729 0.566406 21.2051 1.38409 24.2796C1.842 25.9804 3.183 27.3214 4.88379 27.7793C8.0237 28.6297 20.4198 28.6297 20.4198 28.6297C20.4198 28.6297 32.8486 28.6297 35.9558 27.812C37.6566 27.3541 38.9976 26.0131 39.4555 24.3123C40.2732 21.2051 40.2732 14.7618 40.2732 14.7618C40.2732 14.7618 40.3059 8.28567 39.4555 5.17846Z'
                    fill='currentColor'
                  />
                  <path
                    d='M16.4609 8.77612V20.6816L26.7966 14.7289L16.4609 8.77612Z'
                    fill='white'
                  />
                  <path
                    d='M64.272 25.0647C63.487 24.5413 62.931 23.7237 62.6039 22.5789C62.2768 21.4669 62.1133 19.9623 62.1133 18.1307V15.6122C62.1133 13.7479 62.3095 12.2434 62.6693 11.0986C63.0618 9.95386 63.6505 9.13618 64.4355 8.61286C65.2532 8.08954 66.2998 7.82788 67.6081 7.82788C68.8837 7.82788 69.9304 8.08954 70.7153 8.61286C71.5003 9.13618 72.0564 9.98657 72.4161 11.0986C72.7759 12.2107 72.9722 13.7152 72.9722 15.6122V18.1307C72.9722 19.995 72.8086 21.4669 72.4488 22.6116C72.0891 23.7237 71.533 24.5741 70.7481 25.0974C69.9631 25.6207 68.8837 25.8824 67.5427 25.8824C66.169 25.8496 65.057 25.588 64.272 25.0647ZM68.6875 22.3172C68.9164 21.7612 69.0146 20.8127 69.0146 19.5371V14.1077C69.0146 12.8648 68.9164 11.949 68.6875 11.3603C68.4585 10.7715 68.0988 10.5099 67.5427 10.5099C67.0194 10.5099 66.6269 10.8043 66.4307 11.3603C66.2017 11.949 66.1036 12.8648 66.1036 14.1077V19.5371C66.1036 20.8127 66.2017 21.7612 66.4307 22.3172C66.6269 22.8733 67.0194 23.1676 67.5754 23.1676C68.0987 23.1676 68.4585 22.906 68.6875 22.3172Z'
                    fill='currentColor'
                  />
                  <path
                    d='M124.649 18.1634V19.0465C124.649 20.1586 124.682 21.009 124.748 21.565C124.813 22.121 124.944 22.5462 125.173 22.7752C125.369 23.0368 125.696 23.1677 126.154 23.1677C126.743 23.1677 127.135 22.9387 127.364 22.4808C127.593 22.0229 127.691 21.2706 127.724 20.1913L131.093 20.3875C131.125 20.5511 131.125 20.7473 131.125 21.009C131.125 22.6117 130.7 23.8218 129.817 24.6068C128.934 25.3918 127.691 25.7843 126.089 25.7843C124.159 25.7843 122.818 25.1628 122.033 23.9527C121.248 22.7425 120.855 20.8782 120.855 18.327V15.2852C120.855 12.6686 121.248 10.7715 122.066 9.56136C122.883 8.35119 124.257 7.76245 126.187 7.76245C127.528 7.76245 128.574 8.02411 129.294 8.51472C130.013 9.00534 130.504 9.79032 130.798 10.8042C131.093 11.8509 131.223 13.29 131.223 15.1216V18.098H124.649V18.1634ZM125.14 10.837C124.944 11.0986 124.813 11.4911 124.748 12.0471C124.682 12.6032 124.649 13.4536 124.649 14.5983V15.8412H127.528V14.5983C127.528 13.4863 127.495 12.6359 127.43 12.0471C127.364 11.4584 127.201 11.0659 127.004 10.837C126.808 10.608 126.481 10.4772 126.089 10.4772C125.631 10.4445 125.336 10.5753 125.14 10.837Z'
                    fill='currentColor'
                  />
                  <path
                    d='M54.7216 17.8362L50.2734 1.71143H54.1656L55.7356 9.0052C56.1281 10.8041 56.4224 12.3414 56.6187 13.617H56.7168C56.8476 12.7011 57.142 11.1966 57.5999 9.0379L59.2353 1.71143H63.1274L58.6138 17.8362V25.5552H54.7543V17.8362H54.7216Z'
                    fill='currentColor'
                  />
                  <path
                    d='M85.6299 8.15479V25.5878H82.5554L82.2283 23.4619H82.1302C81.3125 25.0645 80.0369 25.8822 78.3688 25.8822C77.2241 25.8822 76.3737 25.4897 75.8177 24.7375C75.2617 23.9852 75 22.8077 75 21.1723V8.15479H78.9249V20.9434C78.9249 21.7284 79.023 22.2844 79.1865 22.6115C79.3501 22.9385 79.6444 23.1021 80.0369 23.1021C80.364 23.1021 80.6911 23.004 81.0181 22.775C81.3452 22.5788 81.5742 22.3171 81.705 21.99V8.15479H85.6299Z'
                    fill='currentColor'
                  />
                  <path
                    d='M105.747 8.15479V25.5878H102.673L102.346 23.4619H102.247C101.43 25.0645 100.154 25.8822 98.4861 25.8822C97.3413 25.8822 96.4909 25.4897 95.9349 24.7375C95.3788 23.9852 95.1172 22.8077 95.1172 21.1723V8.15479H99.0421V20.9434C99.0421 21.7284 99.1402 22.2844 99.3038 22.6115C99.4673 22.9385 99.7617 23.1021 100.154 23.1021C100.481 23.1021 100.808 23.004 101.135 22.775C101.462 22.5788 101.691 22.3171 101.822 21.99V8.15479H105.747Z'
                    fill='currentColor'
                  />
                  <path
                    d='M96.2907 4.88405H92.3986V25.5552H88.5718V4.88405H84.6797V1.71143H96.2907V4.88405Z'
                    fill='currentColor'
                  />
                  <path
                    d='M118.731 10.935C118.502 9.82293 118.11 9.03795 117.587 8.54734C117.063 8.05672 116.311 7.79506 115.395 7.79506C114.676 7.79506 113.989 7.99131 113.367 8.41651C112.746 8.809 112.255 9.36502 111.928 10.0192H111.896V0.828369H108.102V25.5552H111.34L111.732 23.9199H111.83C112.125 24.5086 112.582 24.9665 113.204 25.3263C113.825 25.6533 114.479 25.8496 115.232 25.8496C116.573 25.8496 117.521 25.2281 118.143 24.018C118.764 22.8078 119.091 20.8781 119.091 18.2942V15.5467C119.059 13.5516 118.96 12.0143 118.731 10.935ZM115.134 18.0325C115.134 19.3081 115.068 20.2893 114.97 21.0089C114.872 21.7285 114.676 22.2518 114.447 22.5461C114.185 22.8405 113.858 23.004 113.466 23.004C113.138 23.004 112.844 22.9386 112.582 22.7751C112.321 22.6116 112.092 22.3826 111.928 22.0882V12.2106C112.059 11.7527 112.288 11.3602 112.615 11.0331C112.942 10.7387 113.302 10.5752 113.662 10.5752C114.054 10.5752 114.381 10.7387 114.578 11.0331C114.807 11.3602 114.937 11.8835 115.036 12.6031C115.134 13.3553 115.166 14.402 115.166 15.743V18.0325H115.134Z'
                    fill='currentColor'
                  />
                </svg>
              </a>
              <a
                href='#'
                className='mr-5 mb-5 lg:mb-0 hover:text-gray-800 dark:hover:text-gray-400'
              >
                <svg
                  className='h-11'
                  viewBox='0 0 208 42'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M42.7714 20.729C42.7714 31.9343 33.6867 41.019 22.4814 41.019C11.2747 41.019 2.19141 31.9343 2.19141 20.729C2.19141 9.52228 11.2754 0.438965 22.4814 0.438965C33.6867 0.438965 42.7714 9.52297 42.7714 20.729Z'
                    fill='currentColor'
                  />
                  <path
                    d='M25.1775 21.3312H20.1389V15.9959H25.1775C25.5278 15.9959 25.8747 16.0649 26.1983 16.1989C26.522 16.333 26.8161 16.5295 27.0638 16.7772C27.3115 17.0249 27.508 17.319 27.6421 17.6427C27.7761 17.9663 27.8451 18.3132 27.8451 18.6635C27.8451 19.0139 27.7761 19.3608 27.6421 19.6844C27.508 20.0081 27.3115 20.3021 27.0638 20.5499C26.8161 20.7976 26.522 20.9941 26.1983 21.1281C25.8747 21.2622 25.5278 21.3312 25.1775 21.3312ZM25.1775 12.439H16.582V30.2234H20.1389V24.8881H25.1775C28.6151 24.8881 31.402 22.1012 31.402 18.6635C31.402 15.2258 28.6151 12.439 25.1775 12.439Z'
                    fill='white'
                  />
                  <path
                    d='M74.9361 17.4611C74.9361 16.1521 73.9305 15.3588 72.6239 15.3588H69.1216V19.5389H72.6248C73.9313 19.5389 74.9369 18.7457 74.9369 17.4611H74.9361ZM65.8047 28.2977V12.439H73.0901C76.4778 12.439 78.3213 14.7283 78.3213 17.4611C78.3213 20.1702 76.4542 22.4588 73.0901 22.4588H69.1216V28.2977H65.8055H65.8047ZM80.3406 28.2977V16.7362H83.3044V18.2543C84.122 17.2731 85.501 16.4563 86.9027 16.4563V19.3518C86.6912 19.3054 86.4349 19.2826 86.0851 19.2826C85.1039 19.2826 83.7949 19.8424 83.3044 20.5681V28.2977H80.3397H80.3406ZM96.8802 22.3652C96.8802 20.6136 95.8503 19.0955 93.9823 19.0955C92.1364 19.0955 91.1105 20.6136 91.1105 22.366C91.1105 24.1404 92.1364 25.6585 93.9823 25.6585C95.8503 25.6585 96.8794 24.1404 96.8794 22.3652H96.8802ZM88.0263 22.3652C88.0263 19.1663 90.2684 16.4563 93.9823 16.4563C97.7198 16.4563 99.962 19.1655 99.962 22.3652C99.962 25.5649 97.7198 28.2977 93.9823 28.2977C90.2684 28.2977 88.0263 25.5649 88.0263 22.3652ZM109.943 24.3739V20.3801C109.452 19.6316 108.378 19.0955 107.396 19.0955C105.693 19.0955 104.524 20.4265 104.524 22.366C104.524 24.3267 105.693 25.6585 107.396 25.6585C108.378 25.6585 109.452 25.1215 109.943 24.3731V24.3739ZM109.943 28.2977V26.5697C109.054 27.6899 107.841 28.2977 106.462 28.2977C103.637 28.2977 101.465 26.1499 101.465 22.3652C101.465 18.6993 103.59 16.4563 106.462 16.4563C107.793 16.4563 109.054 17.0177 109.943 18.1843V12.439H112.932V28.2977H109.943ZM123.497 28.2977V26.5925C122.727 27.4337 121.372 28.2977 119.526 28.2977C117.052 28.2977 115.884 26.9431 115.884 24.7473V16.7362H118.849V23.5798C118.849 25.1451 119.666 25.6585 120.927 25.6585C122.071 25.6585 122.983 25.028 123.497 24.3731V16.7362H126.463V28.2977H123.497ZM128.69 22.3652C128.69 18.9092 131.212 16.4563 134.67 16.4563C136.982 16.4563 138.383 17.4611 139.131 18.4886L137.191 20.3093C136.655 19.5153 135.838 19.0955 134.81 19.0955C133.011 19.0955 131.751 20.4037 131.751 22.366C131.751 24.3267 133.011 25.6585 134.81 25.6585C135.838 25.6585 136.655 25.1915 137.191 24.4203L139.131 26.2426C138.383 27.2702 136.982 28.2977 134.67 28.2977C131.212 28.2977 128.69 25.8456 128.69 22.3652ZM141.681 25.1915V19.329H139.813V16.7362H141.681V13.6528H144.648V16.7362H146.935V19.329H144.648V24.3975C144.648 25.1215 145.02 25.6585 145.675 25.6585C146.118 25.6585 146.541 25.495 146.702 25.3087L147.334 27.5728C146.891 27.9714 146.096 28.2977 144.857 28.2977C142.779 28.2977 141.681 27.2238 141.681 25.1915ZM165.935 28.2977V21.454H158.577V28.2977H155.263V12.439H158.577V18.5577H165.935V12.4398H169.275V28.2977H165.935ZM179.889 28.2977V26.5925C179.119 27.4337 177.764 28.2977 175.919 28.2977C173.443 28.2977 172.276 26.9431 172.276 24.7473V16.7362H175.241V23.5798C175.241 25.1451 176.058 25.6585 177.32 25.6585C178.464 25.6585 179.376 25.028 179.889 24.3731V16.7362H182.856V28.2977H179.889ZM193.417 28.2977V21.1986C193.417 19.6333 192.602 19.0963 191.339 19.0963C190.172 19.0963 189.285 19.7504 188.77 20.4045V28.2985H185.806V16.7362H188.77V18.1843C189.495 17.3439 190.896 16.4563 192.718 16.4563C195.217 16.4563 196.408 17.8573 196.408 20.0523V28.2977H193.418H193.417ZM199.942 25.1915V19.329H198.076V16.7362H199.943V13.6528H202.91V16.7362H205.198V19.329H202.91V24.3975C202.91 25.1215 203.282 25.6585 203.936 25.6585C204.38 25.6585 204.802 25.495 204.965 25.3087L205.595 27.5728C205.152 27.9714 204.356 28.2977 203.119 28.2977C201.04 28.2977 199.943 27.2238 199.943 25.1915'
                    fill='currentColor'
                  />
                </svg>
              </a>
              <a
                href='#'
                className='mr-5 mb-5 lg:mb-0 hover:text-gray-800 dark:hover:text-gray-400'
              >
                <svg
                  className='h-11'
                  viewBox='0 0 120 41'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M20.058 40.5994C31.0322 40.5994 39.9286 31.7031 39.9286 20.7289C39.9286 9.75473 31.0322 0.858398 20.058 0.858398C9.08385 0.858398 0.1875 9.75473 0.1875 20.7289C0.1875 31.7031 9.08385 40.5994 20.058 40.5994Z'
                    fill='currentColor'
                  />
                  <path
                    d='M33.3139 20.729C33.3139 19.1166 32.0101 17.8362 30.4211 17.8362C29.6388 17.8362 28.9272 18.1442 28.4056 18.6424C26.414 17.2196 23.687 16.2949 20.6518 16.1765L21.9796 9.96387L26.2951 10.8885C26.3429 11.9793 27.2437 12.8567 28.3584 12.8567C29.4965 12.8567 30.4211 11.9321 30.4211 10.7935C30.4211 9.65536 29.4965 8.73071 28.3584 8.73071C27.5522 8.73071 26.8406 9.20497 26.5086 9.89271L21.6954 8.87303C21.553 8.84917 21.4107 8.87303 21.3157 8.94419C21.1972 9.01535 21.1261 9.13381 21.1026 9.27613L19.6321 16.1999C16.5497 16.2949 13.7753 17.2196 11.7599 18.6662C11.2171 18.1478 10.495 17.8589 9.74439 17.86C8.13201 17.86 6.85156 19.1639 6.85156 20.7529C6.85156 21.9383 7.56272 22.9341 8.55897 23.3849C8.51123 23.6691 8.48781 23.9538 8.48781 24.2623C8.48781 28.7197 13.6807 32.348 20.083 32.348C26.4852 32.348 31.6781 28.7436 31.6781 24.2623C31.6781 23.9776 31.6543 23.6691 31.607 23.3849C32.6028 22.9341 33.3139 21.9144 33.3139 20.729ZM13.4434 22.7918C13.4434 21.6536 14.368 20.729 15.5066 20.729C16.6447 20.729 17.5694 21.6536 17.5694 22.7918C17.5694 23.9299 16.6447 24.855 15.5066 24.855C14.368 24.8784 13.4434 23.9299 13.4434 22.7918ZM24.9913 28.2694C23.5685 29.6921 20.8653 29.7872 20.083 29.7872C19.2768 29.7872 16.5736 29.6683 15.1742 28.2694C14.9612 28.0559 14.9612 27.7239 15.1742 27.5105C15.3877 27.2974 15.7196 27.2974 15.9331 27.5105C16.8343 28.4117 18.7314 28.7197 20.083 28.7197C21.4346 28.7197 23.355 28.4117 24.2324 27.5105C24.4459 27.2974 24.7778 27.2974 24.9913 27.5105C25.1809 27.7239 25.1809 28.0559 24.9913 28.2694ZM24.6116 24.8784C23.4735 24.8784 22.5488 23.9538 22.5488 22.8156C22.5488 21.6775 23.4735 20.7529 24.6116 20.7529C25.7502 20.7529 26.6748 21.6775 26.6748 22.8156C26.6748 23.9299 25.7502 24.8784 24.6116 24.8784Z'
                    fill='white'
                  />
                  <path
                    d='M108.412 16.6268C109.8 16.6268 110.926 15.5014 110.926 14.1132C110.926 12.725 109.8 11.5996 108.412 11.5996C107.024 11.5996 105.898 12.725 105.898 14.1132C105.898 15.5014 107.024 16.6268 108.412 16.6268Z'
                    fill='currentColor'
                  />
                  <path
                    d='M72.5114 24.8309C73.7446 24.8309 74.4557 23.9063 74.4084 23.0051C74.385 22.5308 74.3373 22.2223 74.29 21.9854C73.5311 18.7133 70.8756 16.2943 67.7216 16.2943C63.9753 16.2943 60.9401 19.6853 60.9401 23.8586C60.9401 28.0318 63.9753 31.4228 67.7216 31.4228C70.0694 31.4228 71.753 30.5693 72.9622 29.2177C73.5549 28.5538 73.4365 27.5341 72.7249 27.036C72.1322 26.6329 71.3972 26.7752 70.8517 27.2256C70.3302 27.6765 69.3344 28.5772 67.7216 28.5772C65.825 28.5772 64.2126 26.941 63.8568 24.7832H72.5114V24.8309ZM67.6981 19.1637C69.4051 19.1637 70.8756 20.4915 71.421 22.3173H63.9752C64.5207 20.468 65.9907 19.1637 67.6981 19.1637ZM61.0824 17.7883C61.0824 17.0771 60.5609 16.5078 59.897 16.3894C57.8338 16.0813 55.8895 16.8397 54.7752 18.2391V18.049C54.7752 17.1717 54.0636 16.6267 53.3525 16.6267C52.5697 16.6267 51.9297 17.2667 51.9297 18.049V29.6681C51.9297 30.427 52.4985 31.0908 53.2574 31.1381C54.0875 31.1854 54.7752 30.5454 54.7752 29.7154V23.7162C54.7752 21.0608 56.7668 18.8791 59.5173 19.1876H59.802C60.5131 19.1399 61.0824 18.5233 61.0824 17.7883ZM109.834 19.306C109.834 18.5233 109.194 17.8833 108.412 17.8833C107.629 17.8833 106.989 18.5233 106.989 19.306V29.7154C106.989 30.4981 107.629 31.1381 108.412 31.1381C109.194 31.1381 109.834 30.4981 109.834 29.7154V19.306ZM88.6829 11.4338C88.6829 10.651 88.0429 10.011 87.2602 10.011C86.4779 10.011 85.8379 10.651 85.8379 11.4338V17.7648C84.8655 16.7924 83.6562 16.3182 82.2096 16.3182C78.4632 16.3182 75.4281 19.7091 75.4281 23.8824C75.4281 28.0557 78.4632 31.4466 82.2096 31.4466C83.6562 31.4466 84.8893 30.9485 85.8613 29.9761C85.9797 30.6405 86.5729 31.1381 87.2602 31.1381C88.0429 31.1381 88.6829 30.4981 88.6829 29.7154V11.4338ZM82.2334 28.6245C80.0518 28.6245 78.2971 26.5145 78.2971 23.8824C78.2971 21.2742 80.0518 19.1399 82.2334 19.1399C84.4151 19.1399 86.1698 21.2504 86.1698 23.8824C86.1698 26.5145 84.3912 28.6245 82.2334 28.6245ZM103.527 11.4338C103.527 10.651 102.887 10.011 102.104 10.011C101.322 10.011 100.681 10.651 100.681 11.4338V17.7648C99.7093 16.7924 98.5 16.3182 97.0534 16.3182C93.307 16.3182 90.2719 19.7091 90.2719 23.8824C90.2719 28.0557 93.307 31.4466 97.0534 31.4466C98.5 31.4466 99.7327 30.9485 100.705 29.9761C100.824 30.6405 101.416 31.1381 102.104 31.1381C102.887 31.1381 103.527 30.4981 103.527 29.7154V11.4338ZM97.0534 28.6245C94.8717 28.6245 93.1174 26.5145 93.1174 23.8824C93.1174 21.2742 94.8717 19.1399 97.0534 19.1399C99.235 19.1399 100.99 21.2504 100.99 23.8824C100.99 26.5145 99.235 28.6245 97.0534 28.6245ZM117.042 29.7392V19.1637H118.299C118.963 19.1637 119.556 18.6656 119.603 17.9779C119.651 17.2428 119.058 16.6267 118.347 16.6267H117.042V14.6347C117.042 13.8758 116.474 13.2119 115.715 13.1646C114.885 13.1173 114.197 13.7573 114.197 14.5874V16.6501H113.011C112.348 16.6501 111.755 17.1483 111.708 17.836C111.66 18.571 112.253 19.1876 112.964 19.1876H114.173V29.7631C114.173 30.5454 114.814 31.1854 115.596 31.1854C116.426 31.1381 117.042 30.5216 117.042 29.7392Z'
                    fill='currentColor'
                  />
                </svg>
              </a>
            </div>
          </div>

          <div className='container mx-auto px-4 py-12 max-w-6xl bg-secondary'>
            <div className='text-center mb-16'>
              <h1 className='text-4xl font-bold mb-4'>
                {t('howItWorksTitle')}
              </h1>
              <p className='text-xl text-gray-600'>{t('howItWorksSubtitle')}</p>
            </div>

            <div className='space-y-12'>
              {steps.map((step, index) => (
                <div
                  key={index}
                  className='flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow'
                >
                  <div className='p-4 bg-gray-50 rounded-full'>{step.icon}</div>
                  <div>
                    <h2 className='text-xl font-semibold mb-2'>{step.title}</h2>
                    <p className='text-gray-600'>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className='mt-16 text-center bg-gray-50 p-8 rounded-lg'>
              <h2 className='text-2xl font-bold mb-4'>{t('readyToStart')}</h2>
              <p className='text-gray-600 mb-6'>
                {t('readyToStartDescription')}
              </p>
              <a
                href='/dashboard'
                className='inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors'
              >
                {t('startPracticing')}
              </a>
            </div>
          </div>
          <Footer />
        </section>
      </div>
    </div>
  );

  // return (
  //   <div>
  //     <Header />
  //     <section className=''>
  //       <img
  //         alt=''
  //         src='/images/inv.jpg'
  //         className='absolute inset-0 h-full w-full object-cover brightness-[40%] z-[-1]'
  //       />
  //       <div className='py-32 px-4 mx-auto max-w-screen-xl text-center lg:py-32 lg:px-12 z-10'>
  //         <h1 className='mb-4 text-4xl font-extrabold tracking-tight leading-none text-white md:text-5xl lg:text-6xl dark:text-white'>
  //           {t('title')}
  //         </h1>
  //         <p className='mb-8 text-lg font-normal text-gray-100 lg:text-xl sm:px-16 xl:px-48'>
  //           {t('subtitle')}
  //         </p>
  //         <div className='flex mb-8 lg:mb-16 space-y-4 flex-row justify-center space-x-4'>
  //           <a
  //             href='/dashboard'
  //             className='inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-primary hover:bg-primary hover:ring-4 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900'
  //           >
  //             {t('getStarted')}
  //             <svg
  //               className='ml-2 -mr-1 w-5 h-5'
  //               fill='currentColor'
  //               viewBox='0 0 20 20'
  //               xmlns='http://www.w3.org/2000/svg'
  //             >
  //               <path
  //                 fill-rule='evenodd'
  //                 d='M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z'
  //                 clip-rule='evenodd'
  //               ></path>
  //             </svg>
  //           </a>
  //           {/* <a
  //             href='https://youtu.be/Q5LM985yUmQ'
  //             className='inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-gray-900 rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 dark:focus:ring-gray-800'
  //           >
  //             <svg
  //               className='mr-2 -ml-1 w-5 h-5'
  //               fill='currentColor'
  //               viewBox='0 0 20 20'
  //               xmlns='http://www.w3.org/2000/svg'
  //             >
  //               <path d='M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z'></path>
  //             </svg>
  //             Watch video
  //           </a> */}
  //         </div>
  //         <div className='px-4 mx-auto text-center md:max-w-screen-md lg:max-w-screen-lg lg:px-36'>
  //           <span className='font-semibold text-gray-400 uppercase'>
  //             FEATURED IN
  //           </span>
  //           <div className='flex flex-wrap justify-center items-center mt-8 text-gray-500 sm:justify-between'>
  //             <a
  //               href='#'
  //               className='mr-5 mb-5 lg:mb-0 hover:text-gray-800 dark:hover:text-gray-400'
  //             >
  //               <svg
  //                 className='h-8'
  //                 viewBox='0 0 132 29'
  //                 fill='none'
  //                 xmlns='http://www.w3.org/2000/svg'
  //               >
  //                 <path
  //                   d='M39.4555 5.17846C38.9976 3.47767 37.6566 2.13667 35.9558 1.67876C32.8486 0.828369 20.4198 0.828369 20.4198 0.828369C20.4198 0.828369 7.99099 0.828369 4.88379 1.64606C3.21571 2.10396 1.842 3.47767 1.38409 5.17846C0.566406 8.28567 0.566406 14.729 0.566406 14.729C0.566406 14.729 0.566406 21.2051 1.38409 24.2796C1.842 25.9804 3.183 27.3214 4.88379 27.7793C8.0237 28.6297 20.4198 28.6297 20.4198 28.6297C20.4198 28.6297 32.8486 28.6297 35.9558 27.812C37.6566 27.3541 38.9976 26.0131 39.4555 24.3123C40.2732 21.2051 40.2732 14.7618 40.2732 14.7618C40.2732 14.7618 40.3059 8.28567 39.4555 5.17846Z'
  //                   fill='currentColor'
  //                 />
  //                 <path
  //                   d='M16.4609 8.77612V20.6816L26.7966 14.7289L16.4609 8.77612Z'
  //                   fill='white'
  //                 />
  //                 <path
  //                   d='M64.272 25.0647C63.487 24.5413 62.931 23.7237 62.6039 22.5789C62.2768 21.4669 62.1133 19.9623 62.1133 18.1307V15.6122C62.1133 13.7479 62.3095 12.2434 62.6693 11.0986C63.0618 9.95386 63.6505 9.13618 64.4355 8.61286C65.2532 8.08954 66.2998 7.82788 67.6081 7.82788C68.8837 7.82788 69.9304 8.08954 70.7153 8.61286C71.5003 9.13618 72.0564 9.98657 72.4161 11.0986C72.7759 12.2107 72.9722 13.7152 72.9722 15.6122V18.1307C72.9722 19.995 72.8086 21.4669 72.4488 22.6116C72.0891 23.7237 71.533 24.5741 70.7481 25.0974C69.9631 25.6207 68.8837 25.8824 67.5427 25.8824C66.169 25.8496 65.057 25.588 64.272 25.0647ZM68.6875 22.3172C68.9164 21.7612 69.0146 20.8127 69.0146 19.5371V14.1077C69.0146 12.8648 68.9164 11.949 68.6875 11.3603C68.4585 10.7715 68.0988 10.5099 67.5427 10.5099C67.0194 10.5099 66.6269 10.8043 66.4307 11.3603C66.2017 11.949 66.1036 12.8648 66.1036 14.1077V19.5371C66.1036 20.8127 66.2017 21.7612 66.4307 22.3172C66.6269 22.8733 67.0194 23.1676 67.5754 23.1676C68.0987 23.1676 68.4585 22.906 68.6875 22.3172Z'
  //                   fill='currentColor'
  //                 />
  //                 <path
  //                   d='M124.649 18.1634V19.0465C124.649 20.1586 124.682 21.009 124.748 21.565C124.813 22.121 124.944 22.5462 125.173 22.7752C125.369 23.0368 125.696 23.1677 126.154 23.1677C126.743 23.1677 127.135 22.9387 127.364 22.4808C127.593 22.0229 127.691 21.2706 127.724 20.1913L131.093 20.3875C131.125 20.5511 131.125 20.7473 131.125 21.009C131.125 22.6117 130.7 23.8218 129.817 24.6068C128.934 25.3918 127.691 25.7843 126.089 25.7843C124.159 25.7843 122.818 25.1628 122.033 23.9527C121.248 22.7425 120.855 20.8782 120.855 18.327V15.2852C120.855 12.6686 121.248 10.7715 122.066 9.56136C122.883 8.35119 124.257 7.76245 126.187 7.76245C127.528 7.76245 128.574 8.02411 129.294 8.51472C130.013 9.00534 130.504 9.79032 130.798 10.8042C131.093 11.8509 131.223 13.29 131.223 15.1216V18.098H124.649V18.1634ZM125.14 10.837C124.944 11.0986 124.813 11.4911 124.748 12.0471C124.682 12.6032 124.649 13.4536 124.649 14.5983V15.8412H127.528V14.5983C127.528 13.4863 127.495 12.6359 127.43 12.0471C127.364 11.4584 127.201 11.0659 127.004 10.837C126.808 10.608 126.481 10.4772 126.089 10.4772C125.631 10.4445 125.336 10.5753 125.14 10.837Z'
  //                   fill='currentColor'
  //                 />
  //                 <path
  //                   d='M54.7216 17.8362L50.2734 1.71143H54.1656L55.7356 9.0052C56.1281 10.8041 56.4224 12.3414 56.6187 13.617H56.7168C56.8476 12.7011 57.142 11.1966 57.5999 9.0379L59.2353 1.71143H63.1274L58.6138 17.8362V25.5552H54.7543V17.8362H54.7216Z'
  //                   fill='currentColor'
  //                 />
  //                 <path
  //                   d='M85.6299 8.15479V25.5878H82.5554L82.2283 23.4619H82.1302C81.3125 25.0645 80.0369 25.8822 78.3688 25.8822C77.2241 25.8822 76.3737 25.4897 75.8177 24.7375C75.2617 23.9852 75 22.8077 75 21.1723V8.15479H78.9249V20.9434C78.9249 21.7284 79.023 22.2844 79.1865 22.6115C79.3501 22.9385 79.6444 23.1021 80.0369 23.1021C80.364 23.1021 80.6911 23.004 81.0181 22.775C81.3452 22.5788 81.5742 22.3171 81.705 21.99V8.15479H85.6299Z'
  //                   fill='currentColor'
  //                 />
  //                 <path
  //                   d='M105.747 8.15479V25.5878H102.673L102.346 23.4619H102.247C101.43 25.0645 100.154 25.8822 98.4861 25.8822C97.3413 25.8822 96.4909 25.4897 95.9349 24.7375C95.3788 23.9852 95.1172 22.8077 95.1172 21.1723V8.15479H99.0421V20.9434C99.0421 21.7284 99.1402 22.2844 99.3038 22.6115C99.4673 22.9385 99.7617 23.1021 100.154 23.1021C100.481 23.1021 100.808 23.004 101.135 22.775C101.462 22.5788 101.691 22.3171 101.822 21.99V8.15479H105.747Z'
  //                   fill='currentColor'
  //                 />
  //                 <path
  //                   d='M96.2907 4.88405H92.3986V25.5552H88.5718V4.88405H84.6797V1.71143H96.2907V4.88405Z'
  //                   fill='currentColor'
  //                 />
  //                 <path
  //                   d='M118.731 10.935C118.502 9.82293 118.11 9.03795 117.587 8.54734C117.063 8.05672 116.311 7.79506 115.395 7.79506C114.676 7.79506 113.989 7.99131 113.367 8.41651C112.746 8.809 112.255 9.36502 111.928 10.0192H111.896V0.828369H108.102V25.5552H111.34L111.732 23.9199H111.83C112.125 24.5086 112.582 24.9665 113.204 25.3263C113.825 25.6533 114.479 25.8496 115.232 25.8496C116.573 25.8496 117.521 25.2281 118.143 24.018C118.764 22.8078 119.091 20.8781 119.091 18.2942V15.5467C119.059 13.5516 118.96 12.0143 118.731 10.935ZM115.134 18.0325C115.134 19.3081 115.068 20.2893 114.97 21.0089C114.872 21.7285 114.676 22.2518 114.447 22.5461C114.185 22.8405 113.858 23.004 113.466 23.004C113.138 23.004 112.844 22.9386 112.582 22.7751C112.321 22.6116 112.092 22.3826 111.928 22.0882V12.2106C112.059 11.7527 112.288 11.3602 112.615 11.0331C112.942 10.7387 113.302 10.5752 113.662 10.5752C114.054 10.5752 114.381 10.7387 114.578 11.0331C114.807 11.3602 114.937 11.8835 115.036 12.6031C115.134 13.3553 115.166 14.402 115.166 15.743V18.0325H115.134Z'
  //                   fill='currentColor'
  //                 />
  //               </svg>
  //             </a>
  //             <a
  //               href='#'
  //               className='mr-5 mb-5 lg:mb-0 hover:text-gray-800 dark:hover:text-gray-400'
  //             >
  //               <svg
  //                 className='h-11'
  //                 viewBox='0 0 208 42'
  //                 fill='none'
  //                 xmlns='http://www.w3.org/2000/svg'
  //               >
  //                 <path
  //                   d='M42.7714 20.729C42.7714 31.9343 33.6867 41.019 22.4814 41.019C11.2747 41.019 2.19141 31.9343 2.19141 20.729C2.19141 9.52228 11.2754 0.438965 22.4814 0.438965C33.6867 0.438965 42.7714 9.52297 42.7714 20.729Z'
  //                   fill='currentColor'
  //                 />
  //                 <path
  //                   d='M25.1775 21.3312H20.1389V15.9959H25.1775C25.5278 15.9959 25.8747 16.0649 26.1983 16.1989C26.522 16.333 26.8161 16.5295 27.0638 16.7772C27.3115 17.0249 27.508 17.319 27.6421 17.6427C27.7761 17.9663 27.8451 18.3132 27.8451 18.6635C27.8451 19.0139 27.7761 19.3608 27.6421 19.6844C27.508 20.0081 27.3115 20.3021 27.0638 20.5499C26.8161 20.7976 26.522 20.9941 26.1983 21.1281C25.8747 21.2622 25.5278 21.3312 25.1775 21.3312ZM25.1775 12.439H16.582V30.2234H20.1389V24.8881H25.1775C28.6151 24.8881 31.402 22.1012 31.402 18.6635C31.402 15.2258 28.6151 12.439 25.1775 12.439Z'
  //                   fill='white'
  //                 />
  //                 <path
  //                   d='M74.9361 17.4611C74.9361 16.1521 73.9305 15.3588 72.6239 15.3588H69.1216V19.5389H72.6248C73.9313 19.5389 74.9369 18.7457 74.9369 17.4611H74.9361ZM65.8047 28.2977V12.439H73.0901C76.4778 12.439 78.3213 14.7283 78.3213 17.4611C78.3213 20.1702 76.4542 22.4588 73.0901 22.4588H69.1216V28.2977H65.8055H65.8047ZM80.3406 28.2977V16.7362H83.3044V18.2543C84.122 17.2731 85.501 16.4563 86.9027 16.4563V19.3518C86.6912 19.3054 86.4349 19.2826 86.0851 19.2826C85.1039 19.2826 83.7949 19.8424 83.3044 20.5681V28.2977H80.3397H80.3406ZM96.8802 22.3652C96.8802 20.6136 95.8503 19.0955 93.9823 19.0955C92.1364 19.0955 91.1105 20.6136 91.1105 22.366C91.1105 24.1404 92.1364 25.6585 93.9823 25.6585C95.8503 25.6585 96.8794 24.1404 96.8794 22.3652H96.8802ZM88.0263 22.3652C88.0263 19.1663 90.2684 16.4563 93.9823 16.4563C97.7198 16.4563 99.962 19.1655 99.962 22.3652C99.962 25.5649 97.7198 28.2977 93.9823 28.2977C90.2684 28.2977 88.0263 25.5649 88.0263 22.3652ZM109.943 24.3739V20.3801C109.452 19.6316 108.378 19.0955 107.396 19.0955C105.693 19.0955 104.524 20.4265 104.524 22.366C104.524 24.3267 105.693 25.6585 107.396 25.6585C108.378 25.6585 109.452 25.1215 109.943 24.3731V24.3739ZM109.943 28.2977V26.5697C109.054 27.6899 107.841 28.2977 106.462 28.2977C103.637 28.2977 101.465 26.1499 101.465 22.3652C101.465 18.6993 103.59 16.4563 106.462 16.4563C107.793 16.4563 109.054 17.0177 109.943 18.1843V12.439H112.932V28.2977H109.943ZM123.497 28.2977V26.5925C122.727 27.4337 121.372 28.2977 119.526 28.2977C117.052 28.2977 115.884 26.9431 115.884 24.7473V16.7362H118.849V23.5798C118.849 25.1451 119.666 25.6585 120.927 25.6585C122.071 25.6585 122.983 25.028 123.497 24.3731V16.7362H126.463V28.2977H123.497ZM128.69 22.3652C128.69 18.9092 131.212 16.4563 134.67 16.4563C136.982 16.4563 138.383 17.4611 139.131 18.4886L137.191 20.3093C136.655 19.5153 135.838 19.0955 134.81 19.0955C133.011 19.0955 131.751 20.4037 131.751 22.366C131.751 24.3267 133.011 25.6585 134.81 25.6585C135.838 25.6585 136.655 25.1915 137.191 24.4203L139.131 26.2426C138.383 27.2702 136.982 28.2977 134.67 28.2977C131.212 28.2977 128.69 25.8456 128.69 22.3652ZM141.681 25.1915V19.329H139.813V16.7362H141.681V13.6528H144.648V16.7362H146.935V19.329H144.648V24.3975C144.648 25.1215 145.02 25.6585 145.675 25.6585C146.118 25.6585 146.541 25.495 146.702 25.3087L147.334 27.5728C146.891 27.9714 146.096 28.2977 144.857 28.2977C142.779 28.2977 141.681 27.2238 141.681 25.1915ZM165.935 28.2977V21.454H158.577V28.2977H155.263V12.439H158.577V18.5577H165.935V12.4398H169.275V28.2977H165.935ZM179.889 28.2977V26.5925C179.119 27.4337 177.764 28.2977 175.919 28.2977C173.443 28.2977 172.276 26.9431 172.276 24.7473V16.7362H175.241V23.5798C175.241 25.1451 176.058 25.6585 177.32 25.6585C178.464 25.6585 179.376 25.028 179.889 24.3731V16.7362H182.856V28.2977H179.889ZM193.417 28.2977V21.1986C193.417 19.6333 192.602 19.0963 191.339 19.0963C190.172 19.0963 189.285 19.7504 188.77 20.4045V28.2985H185.806V16.7362H188.77V18.1843C189.495 17.3439 190.896 16.4563 192.718 16.4563C195.217 16.4563 196.408 17.8573 196.408 20.0523V28.2977H193.418H193.417ZM199.942 25.1915V19.329H198.076V16.7362H199.943V13.6528H202.91V16.7362H205.198V19.329H202.91V24.3975C202.91 25.1215 203.282 25.6585 203.936 25.6585C204.38 25.6585 204.802 25.495 204.965 25.3087L205.595 27.5728C205.152 27.9714 204.356 28.2977 203.119 28.2977C201.04 28.2977 199.943 27.2238 199.943 25.1915'
  //                   fill='currentColor'
  //                 />
  //               </svg>
  //             </a>
  //             <a
  //               href='#'
  //               className='mr-5 mb-5 lg:mb-0 hover:text-gray-800 dark:hover:text-gray-400'
  //             >
  //               <svg
  //                 className='h-11'
  //                 viewBox='0 0 120 41'
  //                 fill='none'
  //                 xmlns='http://www.w3.org/2000/svg'
  //               >
  //                 <path
  //                   d='M20.058 40.5994C31.0322 40.5994 39.9286 31.7031 39.9286 20.7289C39.9286 9.75473 31.0322 0.858398 20.058 0.858398C9.08385 0.858398 0.1875 9.75473 0.1875 20.7289C0.1875 31.7031 9.08385 40.5994 20.058 40.5994Z'
  //                   fill='currentColor'
  //                 />
  //                 <path
  //                   d='M33.3139 20.729C33.3139 19.1166 32.0101 17.8362 30.4211 17.8362C29.6388 17.8362 28.9272 18.1442 28.4056 18.6424C26.414 17.2196 23.687 16.2949 20.6518 16.1765L21.9796 9.96387L26.2951 10.8885C26.3429 11.9793 27.2437 12.8567 28.3584 12.8567C29.4965 12.8567 30.4211 11.9321 30.4211 10.7935C30.4211 9.65536 29.4965 8.73071 28.3584 8.73071C27.5522 8.73071 26.8406 9.20497 26.5086 9.89271L21.6954 8.87303C21.553 8.84917 21.4107 8.87303 21.3157 8.94419C21.1972 9.01535 21.1261 9.13381 21.1026 9.27613L19.6321 16.1999C16.5497 16.2949 13.7753 17.2196 11.7599 18.6662C11.2171 18.1478 10.495 17.8589 9.74439 17.86C8.13201 17.86 6.85156 19.1639 6.85156 20.7529C6.85156 21.9383 7.56272 22.9341 8.55897 23.3849C8.51123 23.6691 8.48781 23.9538 8.48781 24.2623C8.48781 28.7197 13.6807 32.348 20.083 32.348C26.4852 32.348 31.6781 28.7436 31.6781 24.2623C31.6781 23.9776 31.6543 23.6691 31.607 23.3849C32.6028 22.9341 33.3139 21.9144 33.3139 20.729ZM13.4434 22.7918C13.4434 21.6536 14.368 20.729 15.5066 20.729C16.6447 20.729 17.5694 21.6536 17.5694 22.7918C17.5694 23.9299 16.6447 24.855 15.5066 24.855C14.368 24.8784 13.4434 23.9299 13.4434 22.7918ZM24.9913 28.2694C23.5685 29.6921 20.8653 29.7872 20.083 29.7872C19.2768 29.7872 16.5736 29.6683 15.1742 28.2694C14.9612 28.0559 14.9612 27.7239 15.1742 27.5105C15.3877 27.2974 15.7196 27.2974 15.9331 27.5105C16.8343 28.4117 18.7314 28.7197 20.083 28.7197C21.4346 28.7197 23.355 28.4117 24.2324 27.5105C24.4459 27.2974 24.7778 27.2974 24.9913 27.5105C25.1809 27.7239 25.1809 28.0559 24.9913 28.2694ZM24.6116 24.8784C23.4735 24.8784 22.5488 23.9538 22.5488 22.8156C22.5488 21.6775 23.4735 20.7529 24.6116 20.7529C25.7502 20.7529 26.6748 21.6775 26.6748 22.8156C26.6748 23.9299 25.7502 24.8784 24.6116 24.8784Z'
  //                   fill='white'
  //                 />
  //                 <path
  //                   d='M108.412 16.6268C109.8 16.6268 110.926 15.5014 110.926 14.1132C110.926 12.725 109.8 11.5996 108.412 11.5996C107.024 11.5996 105.898 12.725 105.898 14.1132C105.898 15.5014 107.024 16.6268 108.412 16.6268Z'
  //                   fill='currentColor'
  //                 />
  //                 <path
  //                   d='M72.5114 24.8309C73.7446 24.8309 74.4557 23.9063 74.4084 23.0051C74.385 22.5308 74.3373 22.2223 74.29 21.9854C73.5311 18.7133 70.8756 16.2943 67.7216 16.2943C63.9753 16.2943 60.9401 19.6853 60.9401 23.8586C60.9401 28.0318 63.9753 31.4228 67.7216 31.4228C70.0694 31.4228 71.753 30.5693 72.9622 29.2177C73.5549 28.5538 73.4365 27.5341 72.7249 27.036C72.1322 26.6329 71.3972 26.7752 70.8517 27.2256C70.3302 27.6765 69.3344 28.5772 67.7216 28.5772C65.825 28.5772 64.2126 26.941 63.8568 24.7832H72.5114V24.8309ZM67.6981 19.1637C69.4051 19.1637 70.8756 20.4915 71.421 22.3173H63.9752C64.5207 20.468 65.9907 19.1637 67.6981 19.1637ZM61.0824 17.7883C61.0824 17.0771 60.5609 16.5078 59.897 16.3894C57.8338 16.0813 55.8895 16.8397 54.7752 18.2391V18.049C54.7752 17.1717 54.0636 16.6267 53.3525 16.6267C52.5697 16.6267 51.9297 17.2667 51.9297 18.049V29.6681C51.9297 30.427 52.4985 31.0908 53.2574 31.1381C54.0875 31.1854 54.7752 30.5454 54.7752 29.7154V23.7162C54.7752 21.0608 56.7668 18.8791 59.5173 19.1876H59.802C60.5131 19.1399 61.0824 18.5233 61.0824 17.7883ZM109.834 19.306C109.834 18.5233 109.194 17.8833 108.412 17.8833C107.629 17.8833 106.989 18.5233 106.989 19.306V29.7154C106.989 30.4981 107.629 31.1381 108.412 31.1381C109.194 31.1381 109.834 30.4981 109.834 29.7154V19.306ZM88.6829 11.4338C88.6829 10.651 88.0429 10.011 87.2602 10.011C86.4779 10.011 85.8379 10.651 85.8379 11.4338V17.7648C84.8655 16.7924 83.6562 16.3182 82.2096 16.3182C78.4632 16.3182 75.4281 19.7091 75.4281 23.8824C75.4281 28.0557 78.4632 31.4466 82.2096 31.4466C83.6562 31.4466 84.8893 30.9485 85.8613 29.9761C85.9797 30.6405 86.5729 31.1381 87.2602 31.1381C88.0429 31.1381 88.6829 30.4981 88.6829 29.7154V11.4338ZM82.2334 28.6245C80.0518 28.6245 78.2971 26.5145 78.2971 23.8824C78.2971 21.2742 80.0518 19.1399 82.2334 19.1399C84.4151 19.1399 86.1698 21.2504 86.1698 23.8824C86.1698 26.5145 84.3912 28.6245 82.2334 28.6245ZM103.527 11.4338C103.527 10.651 102.887 10.011 102.104 10.011C101.322 10.011 100.681 10.651 100.681 11.4338V17.7648C99.7093 16.7924 98.5 16.3182 97.0534 16.3182C93.307 16.3182 90.2719 19.7091 90.2719 23.8824C90.2719 28.0557 93.307 31.4466 97.0534 31.4466C98.5 31.4466 99.7327 30.9485 100.705 29.9761C100.824 30.6405 101.416 31.1381 102.104 31.1381C102.887 31.1381 103.527 30.4981 103.527 29.7154V11.4338ZM97.0534 28.6245C94.8717 28.6245 93.1174 26.5145 93.1174 23.8824C93.1174 21.2742 94.8717 19.1399 97.0534 19.1399C99.235 19.1399 100.99 21.2504 100.99 23.8824C100.99 26.5145 99.235 28.6245 97.0534 28.6245ZM117.042 29.7392V19.1637H118.299C118.963 19.1637 119.556 18.6656 119.603 17.9779C119.651 17.2428 119.058 16.6267 118.347 16.6267H117.042V14.6347C117.042 13.8758 116.474 13.2119 115.715 13.1646C114.885 13.1173 114.197 13.7573 114.197 14.5874V16.6501H113.011C112.348 16.6501 111.755 17.1483 111.708 17.836C111.66 18.571 112.253 19.1876 112.964 19.1876H114.173V29.7631C114.173 30.5454 114.814 31.1854 115.596 31.1854C116.426 31.1381 117.042 30.5216 117.042 29.7392Z'
  //                   fill='currentColor'
  //                 />
  //               </svg>
  //             </a>
  //           </div>
  //         </div>
  //       </div>
  //     </section>
  //   </div>
  // );
}

// utils/schema.js
import { pgTable, serial, text, varchar, integer } from 'drizzle-orm/pg-core';

export const MockInterview = pgTable('mockInterview', {
  id: serial('id').primaryKey(),
  jsonMockResp: text('jsonMockResp').notNull(),
  jobPosition: varchar('jobPosition').notNull(),
  jobDesc: varchar('jobDesc').notNull(),
  jobExperience: varchar('jobExperience').notNull(),
  createdBy: varchar('createdBy').notNull(),
  createdAt: varchar('createdAt'),
  mockId: varchar('mockId').notNull(),
  language: varchar('language', { length: 10 }).notNull().default('en'), // Add this line
});

export const UserAnswer = pgTable('userAnswer', {
  id: serial('id').primaryKey(),
  mockIdRef: varchar('mockId').notNull(),
  question: varchar('question').notNull(),
  correctAns: text('correctAns'),
  userAns: text('userAns'),
  feedback: text('feedback'),
  rating: varchar('rating'),
  userEmail: varchar('userEmail'),
  createdAt: varchar('createdAt'),
  language: varchar('language', { length: 10 }).notNull().default('en-US'), // Add this line
});

// utils/schema.js
export const UserCredits = pgTable('userCredits', {
  id: serial('id').primaryKey(),
  userEmail: varchar('userEmail').notNull(),
  credits: integer('credits').notNull().default(5),
  lastUpdated: timestamp('lastUpdated').notNull().defaultNow(),
});

