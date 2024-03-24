// app/components/CustomSignIn.jsx
'use client';
import { useSignIn } from '@clerk/nextjs';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { useLanguage } from '@/providers/LanguageProvider';
// import { useLanguage } from '../../../providers/LanguageProvider';
import { useLanguage } from '@/app/providers/LanguageProvider';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'sonner';

export default function CustomSignIn() {
  const { language } = useLanguage();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isLoaded) {
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        // Handle successful sign in
      } else {
        toast.error(
          language === 'ko' ? '로그인에 실패했습니다' : 'Sign in failed'
        );
      }
    } catch (err) {
      toast.error(err.errors[0].message);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard',
      });
    } catch (err) {
      toast.error(err.errors[0].message);
    }
  };

  return (
    <div className='w-full max-w-md space-y-8 p-6 bg-white rounded-lg shadow-sm'>
      <div className='text-center'>
        <h2 className='text-2xl font-bold'>
          {language === 'ko'
            ? 'AI-Interview 로그인'
            : 'Sign in to AI-Interview'}
        </h2>
        <p className='mt-2 text-gray-600'>
          {language === 'ko'
            ? '계속하려면 로그인하세요'
            : 'Welcome back! Please sign in to continue'}
        </p>
      </div>

      <Button variant='outline' className='w-full' onClick={signInWithGoogle}>
        <FcGoogle className='mr-2 h-4 w-4' />
        {language === 'ko' ? 'Google로 계속하기' : 'Continue with Google'}
      </Button>

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <div className='w-full border-t border-gray-200' />
        </div>
        <div className='relative flex justify-center text-sm'>
          <span className='px-2 bg-white text-gray-500'>
            {language === 'ko' ? '또는' : 'or'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700'>
            {language === 'ko' ? '이메일' : 'Email address'}
          </label>
          <Input
            type='email'
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            required
            className='mt-1'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700'>
            {language === 'ko' ? '비밀번호' : 'Password'}
          </label>
          <Input
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className='mt-1'
          />
        </div>

        <Button type='submit' className='w-full' disabled={loading}>
          {loading ? (
            <div className='flex items-center justify-center'>
              <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
            </div>
          ) : language === 'ko' ? (
            '로그인'
          ) : (
            'Sign in'
          )}
        </Button>
      </form>

      <p className='text-center text-sm text-gray-600'>
        {language === 'ko' ? '계정이 없으신가요?' : "Don't have an account?"}{' '}
        <a
          href='/sign-up'
          className='font-medium text-primary hover:text-primary/80'
        >
          {language === 'ko' ? '회원가입' : 'Sign up'}
        </a>
      </p>
    </div>
  );
}
