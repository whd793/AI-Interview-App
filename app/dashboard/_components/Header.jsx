'use client';
import { UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import { useLanguage } from '../../providers/LanguageProvider';
import { Menu, Globe, X } from 'lucide-react';

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
      </div>

      {/* Desktop UserButton */}
      <div className='hidden md:block'>
        <UserButton />
      </div>
    </div>
  );
}

export default Header;
