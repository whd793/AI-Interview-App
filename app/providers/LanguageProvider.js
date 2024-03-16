// app/contexts/LanguageContext.js
'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const translations = {
  en: {
    dashboard: 'Dashboard',
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
  },
  ko: {
    dashboard: '대시보드',
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
