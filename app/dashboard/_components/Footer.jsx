// components/Footer.jsx
'use client';
import Link from 'next/link';
import { useLanguage } from '@/app/providers/LanguageProvider';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className='bg-gray-50 border-t'>
      <div className='container mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          {/* Company Info */}
          <div>
            <h3 className='font-bold text-lg mb-4'>{t('companyName')}</h3>
            <p className='text-gray-600 text-sm'>{t('companyDescription')}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className='font-bold text-lg mb-4'>{t('quickLinks')}</h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='/dashboard'
                  className='text-gray-600 hover:text-primary text-sm'
                >
                  {t('dashboard')}
                </Link>
              </li>
              <li>
                <Link
                  href='/how'
                  className='text-gray-600 hover:text-primary text-sm'
                >
                  {t('howItWorks')}
                </Link>
              </li>
              {/* <li>
                <Link
                  href='/dashboard/question-bank'
                  className='text-gray-600 hover:text-primary text-sm'
                >
                  {t('questionBank')}
                </Link>
              </li> */}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className='font-bold text-lg mb-4'>{t('legal')}</h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='/terms'
                  className='text-gray-600 hover:text-primary text-sm'
                >
                  {t('termsOfService')}
                </Link>
              </li>
              <li>
                <Link
                  href='/terms'
                  className='text-gray-600 hover:text-primary text-sm'
                >
                  {t('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link
                  href='/terms'
                  className='text-gray-600 hover:text-primary text-sm'
                >
                  {t('cookiePolicy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className='font-bold text-lg mb-4'>{t('contact')}</h3>
            <ul className='space-y-2'>
              <li>
                <Link
                  href='/contact'
                  className='text-gray-600 hover:text-primary text-sm'
                >
                  {t('contactUs')}
                </Link>
              </li>
              <li className='text-gray-600 text-sm'>Email: whd793@gmail.com</li>
              <li className='text-gray-600 text-sm'>
                {t('businessHours')}: 9AM - 6PM
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className='border-t mt-8 pt-8 text-center text-gray-500 text-sm'>
          <p>
            © {new Date().getFullYear()} AI-Interview. {t('allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}
