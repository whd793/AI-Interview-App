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
