'use client';
import { UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import { useLanguage } from '../../providers/LanguageProvider';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

function Header() {
  const path = usePathname();
  const { t, language, setLanguage } = useLanguage();

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

  return (
    <div className='flex p-4 items-center justify-between bg-secondary shadow-sm'>
      <h1
        className={`text-primary font-bold cursor-pointer ${
          path == '/dashboard' && 'text-primary font-bold'
        }`}
      >
        InterviewHelp AI
      </h1>

      <ul className='hidden md:flex gap-6 items-center'>
        <Link href={'/dashboard'}>
          <li
            className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${
              path == '/dashboard' && 'text-primary font-bold'
            }`}
          >
            {t('dashboard')}
          </li>
        </Link>

        <li
          className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${
            path == '/dashboard/questions' && 'text-primary font-bold'
          }`}
        >
          {t('questions')}
        </li>

        <Link href={'/dashboard/upgrade'}>
          <li
            className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${
              path == '/dashboard/upgrade' && 'text-primary font-bold'
            }`}
          >
            {t('upgrade')}
          </li>
        </Link>

        <li
          className={`hover:text-primary hover:font-bold transition-all cursor-pointer ${
            path == '/dashboard/how' && 'text-primary font-bold'
          }`}
        >
          {t('howItWorks')}
        </li>

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

      <div className='flex items-center gap-4'>
        <UserButton />
      </div>
    </div>
  );
}

export default Header;
