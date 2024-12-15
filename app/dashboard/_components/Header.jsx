// app/dashboard/_components/Header.jsx
'use client';
import { UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
import { useLanguage } from '../../providers/LanguageProvider';
import { Menu, Globe, X } from 'lucide-react';
// import Credits from './Credits';

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

import { BrainCircuit } from 'lucide-react';

import { Inter, Outfit, Work_Sans } from 'next/font/google';

const outfit = Outfit({ subsets: ['latin'] });
const workSans = Work_Sans({ subsets: ['latin'] });

function Header() {
  const path = usePathname();
  const { t, language, setLanguage } = useLanguage();

  const menuItems = [
    { href: '/', label: 'home' },
    { href: '/dashboard', label: 'dashboard' },
    // { href: '/dashboard/questions', label: 'questions' },
    // { href: '/dashboard/upgrade', label: 'upgrade' },
    // { href: '/dashboard/analytics', label: 'analytics' },
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

  // return (
  //   <div className='flex p-4 items-center justify-between bg-secondary shadow-sm'>
  //     <Link href={'/'}>
  //       <h1 className='text-primary font-bold cursor-pointer'>
  //         InterviewHelp AI
  //       </h1>
  //     </Link>

  //     {/* Desktop Navigation */}
  //     <ul className='hidden md:flex gap-6 items-center'>
  //       <NavLinks />
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

  //     {/* Mobile Navigation */}
  //     <div className='md:hidden flex items-center gap-4'>
  //       <Select value={language} onValueChange={setLanguage}>
  //         <SelectTrigger className='w-[90px]'>
  //           <Globe className='mr-2 h-4 w-4' />
  //           <SelectValue>
  //             {language === 'ko' ? '한국어' : 'English'}
  //           </SelectValue>
  //         </SelectTrigger>
  //         <SelectContent>
  //           <SelectItem value='en'>English</SelectItem>
  //           <SelectItem value='ko'>한국어</SelectItem>
  //         </SelectContent>
  //       </Select>

  //       <Sheet>
  //         <SheetTrigger asChild>
  //           <button className='p-2 hover:bg-gray-100 rounded-lg'>
  //             <Menu className='h-6 w-6' />
  //           </button>
  //         </SheetTrigger>
  //         <SheetContent side='right' className='w-[300px] sm:w-[400px]'>
  //           <div className='flex justify-between items-center mb-6'>
  //             <h2 className='text-lg font-semibold'>Menu</h2>
  //             {/* <SheetClose asChild>
  //               <button className='p-2 hover:bg-gray-100 rounded-lg'>
  //                 <X className='h-4 w-4' />
  //               </button>
  //             </SheetClose> */}
  //           </div>
  //           <ul className='flex flex-col'>
  //             <NavLinks
  //               mobile
  //               onItemClick={() =>
  //                 document.querySelector('[data-sheet-close]').click()
  //               }
  //             />
  //           </ul>
  //         </SheetContent>
  //       </Sheet>

  //       <UserButton />
  //     </div>

  //     {/* Desktop UserButton */}
  //     <div className='hidden md:block'>
  //       <UserButton />
  //     </div>

  //     <div className='hidden md:block'>
  //       <Credits />
  //     </div>
  //   </div>
  // );
  // Header.jsx

  return (
    <div className='flex p-4 items-center bg-secondary shadow-sm'>
      {/* Logo - with min-width to prevent squishing */}
      <div className='flex-shrink-0'>
        <Link href={'/'}>
          <h1
            className={`font-bold whitespace-nowrap transition-all duration-300 overflow-hidden
   'w-auto opacity-100'}
    ${outfit.className} text-2xl flex items-center gap-2`}
          >
            <BrainCircuit className='w-8 h-8 text-primary' />
            <div className='flex flex-col'>
              <div className='flex items-center gap-1'>
                <span className='text-primary'>Interview</span>
                <span className='text-gray-600'>AI</span>
              </div>
              <span className='text-xs text-gray-500 -mt-1'>{t('mock')}</span>
            </div>
          </h1>
        </Link>
      </div>

      {/* Desktop Navigation - with overflow handling */}
      <div className='hidden md:flex items-center justify-end flex-1 min-w-0'>
        {/* Navigation Links - with horizontal scroll if needed */}
        <nav className='mr-8 overflow-x-auto'>
          <ul className='flex items-center space-x-8'>
            {menuItems.map((item) => (
              <li key={item.href} className='flex-shrink-0'>
                <Link
                  href={item.href}
                  className={`py-2 inline-block transition-colors hover:text-primary
                    ${
                      path === item.href
                        ? 'text-primary font-semibold'
                        : 'text-gray-600'
                    }`}
                >
                  {t(item.label)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right side items - with flex-shrink-0 to prevent squishing */}
        <div className='flex items-center gap-4 pl-4 border-l border-gray-200 flex-shrink-0'>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className='w-[110px]'>
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
          <UserButton afterSignOutUrl='/' />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className='md:hidden flex items-center gap-4 ml-auto flex-shrink-0'>
        <Sheet>
          <SheetTrigger asChild>
            <button className='p-2 hover:bg-gray-100 rounded-lg transition-colors'>
              <Menu className='h-6 w-6' />
            </button>
          </SheetTrigger>
          <SheetContent side='right' className='w-[300px] sm:w-[400px]'>
            <div className='flex flex-col h-full'>
              <div className='flex items-center justify-between py-4 mb-4 border-b'>
                <h2 className={`${outfit.className} text-lg font-semibold`}>
                  Menu
                </h2>
              </div>
              <nav className='flex-1'>
                <ul className='space-y-1'>
                  {menuItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() =>
                          document.querySelector('[data-sheet-close]').click()
                        }
                        className={`flex items-center py-4 px-2 rounded-lg transition-colors
                          ${
                            path === item.href
                              ? 'text-primary font-semibold bg-primary/5'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                      >
                        {t(item.label)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className='mt-auto pt-4 border-t'>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className='w-full'>
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
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <UserButton afterSignOutUrl='/' />
      </div>
    </div>
  );
  // return (
  //   <div className='flex p-4 items-center justify-between bg-secondary shadow-sm'>
  //     <Link href={'/'}>
  //       {/* <h1 className='text-primary font-bold cursor-pointer'>
  //         InterviewHelp AI
  //       </h1> */}
  //       <h1
  //         className={`font-bold whitespace-nowrap transition-all duration-300 overflow-hidden
  //  w-auto opacity-100'}
  //   ${outfit.className} text-2xl flex items-center gap-2`}
  //       >
  //         <BrainCircuit className='w-8 h-8 text-primary' />
  //         <div className='flex flex-col'>
  //           <div className='flex items-center gap-1'>
  //             <span className='text-primary'>Interview</span>
  //             <span className='text-gray-600'>AI</span>
  //           </div>
  //           <span className='text-xs text-gray-500 -mt-1'>Powered by AI</span>
  //         </div>
  //       </h1>
  //     </Link>

  //     {/* Desktop Navigation */}
  //     <ul className='hidden md:flex gap-6 items-center'>
  //       <NavLinks />
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
  //       {/* <Credits /> */}
  //     </ul>

  //     {/* Mobile Navigation */}
  //     <div className='md:hidden flex items-center gap-4'>
  //       <Sheet>
  //         <SheetTrigger asChild>
  //           <button className='p-2 hover:bg-gray-100 rounded-lg'>
  //             <Menu className='h-6 w-6' />
  //           </button>
  //         </SheetTrigger>
  //         <SheetContent side='right' className='w-[300px] sm:w-[400px]'>
  //           <div className='flex justify-between items-center mb-6'>
  //             <h2 className='text-lg font-semibold'>Menu</h2>
  //           </div>
  //           <ul className='flex flex-col'>
  //             <NavLinks
  //               mobile
  //               onItemClick={() =>
  //                 document.querySelector('[data-sheet-close]').click()
  //               }
  //             />
  //           </ul>
  //         </SheetContent>
  //       </Sheet>
  //       <UserButton />
  //     </div>

  //     {/* Desktop UserButton */}
  //     <div className='hidden md:flex items-center gap-4'>
  //       <UserButton />
  //     </div>
  //   </div>
  // );
}

export default Header;
