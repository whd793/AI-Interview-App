// import React from 'react';
// import Header from './_components/Header';
// import Footer from './_components/Footer';
// function DashboardLayout({ children }) {
//   return (
//     <div>
//       <Header />
//       <div className='mx-5 md:mx-20 lg:mx-36'>{children}</div>
//       <Footer />
//     </div>
//   );
// }

// export default DashboardLayout;

'use client';
import React from 'react';

import Footer from './_components/Footer';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import Credits from './_components/Credits';
import { useLanguage } from '@/app/providers/LanguageProvider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LayoutDashboard,
  MessageSquare,
  BarChart3,
  Settings,
  HelpCircle,
  Menu,
  Globe,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { t, language, setLanguage } = useLanguage();

  const menuItems = [
    {
      href: '/dashboard',
      label: 'dashboard',
      icon: <LayoutDashboard className='w-5 h-5' />,
    },
    {
      href: '/dashboard/questions',
      label: 'questions',
      icon: <MessageSquare className='w-5 h-5' />,
    },
    {
      href: '/dashboard/analytics',
      label: 'analytics',
      icon: <BarChart3 className='w-5 h-5' />,
    },
    {
      href: '/dashboard/upgrade',
      label: 'upgrade',
      icon: <Settings className='w-5 h-5' />,
    },
    {
      href: '/how',
      label: 'howItWorks',
      icon: <HelpCircle className='w-5 h-5' />,
    },
  ];

  const SidebarContent = ({ mobile = false }) => (
    <div className='flex flex-col h-full'>
      <div className='p-6 flex items-center justify-between'>
        <Link href='/'>
          <h1
            className={`text-xl font-bold ${
              !isSidebarOpen && !mobile ? 'hidden' : ''
            }`}
          >
            InterviewHelp AI
          </h1>
        </Link>
        {!mobile && (
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className='p-2 rounded-lg hover:bg-gray-100'
          >
            {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
          </button>
        )}
      </div>

      <nav className='flex-1'>
        <ul className='space-y-1 px-4'>
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                  ${
                    pathname === item.href
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-100'
                  }`}
              >
                {item.icon}
                {(isSidebarOpen || mobile) && <span>{t(item.label)}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {mobile && (
        <div className='p-4 border-t'>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className='w-full'>
              <Globe className='w-4 h-4 mr-2' />
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
      )}
    </div>
  );

  return (
    <div className='min-h-screen flex'>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block fixed top-0 left-0 h-screen border-r bg-white transition-all duration-300
          ${isSidebarOpen ? 'w-64' : 'w-20'}`}
      >
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-20'
        }`}
      >
        {/* Top Header */}
        <header className='h-16 border-b bg-white flex items-center justify-between px-4 sticky top-0 z-10'>
          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <button className='p-2 md:hidden'>
                <Menu className='w-6 h-6' />
              </button>
            </SheetTrigger>
            <SheetContent side='left' className='p-0'>
              <SidebarContent mobile />
            </SheetContent>
          </Sheet>

          <div className='md:hidden'>
            <Link href='/'>
              <h1 className='text-lg font-semibold'>InterviewHelp AI</h1>
            </Link>
          </div>

          <div className='flex items-center gap-4 ml-auto'>
            <div className='hidden md:block'>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className='w-[110px]'>
                  <Globe className='w-4 h-4 mr-2' />
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

            <Credits />
            <UserButton />
          </div>
        </header>

        {/* Main Content Area */}
        <main className='bg-gray-50 p-6 min-h-[calc(100vh-4rem)]'>
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
