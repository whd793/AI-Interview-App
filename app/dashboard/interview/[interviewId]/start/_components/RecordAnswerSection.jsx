'use client';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React, { useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import useSpeechToText from 'react-hook-speech-to-text';
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
function RecordAnswerSection({
  mockInterviewQuestion,
  activeQuestionIndex,
  interviewData,
  setIsProcessing, // Add this prop
}) {
  const { t } = useLanguage();

  const [userAnswer, setUserAnswer] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('ko-KR');
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [transcriptionTimeout, setTranscriptionTimeout] = useState(null);

  const [displayText, setDisplayText] = useState('');

  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
    setResults,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
    speechRecognitionProperties: {
      lang: selectedLanguage,
      interimResults: true,
    },
    // Increased timeout to prevent early stopping
    timeout: 10000,
  });

  const languages = [
    { code: 'ko-KR', name: '한국어' },
    { code: 'en-US', name: 'English' },
    { code: 'ja-JP', name: '日本語' },
    { code: 'zh-CN', name: '中文' },
  ];

  // useEffect(() => {
  //   if (results?.length > 0) {
  //     const newTranscript = results[results.length - 1]?.transcript || '';
  //     setUserAnswer((prev) => prev + ' ' + newTranscript);
  //   }
  // }, [results]);

  useEffect(() => {
    if (results?.length > 0) {
      // Combine all results into one string
      const fullTranscript = results.map((r) => r.transcript).join(' ');
      setUserAnswer(fullTranscript);
      setDisplayText(fullTranscript);
    }
  }, [results]);

  // Add effect for interim results
  useEffect(() => {
    if (interimResult) {
      setDisplayText((prevText) => userAnswer + ' ' + interimResult);
    } else {
      setDisplayText(userAnswer);
    }
  }, [interimResult, userAnswer]);

  // Handle language change
  const handleLanguageChange = (value) => {
    setSelectedLanguage(value);
    if (isRecording) {
      stopSpeechToText();
    }
    setResults([]);
    setUserAnswer('');
  };

  const startRecording = useCallback(async () => {
    setUserAnswer('');
    setResults([]);
    try {
      await startSpeechToText();
      // Clear any existing timeout
      if (transcriptionTimeout) {
        clearTimeout(transcriptionTimeout);
      }
    } catch (err) {
      toast.error(`Failed to start recording: ${err.message}`);
    }
  }, [startSpeechToText, transcriptionTimeout]);

  const stopRecording = useCallback(async () => {
    try {
      await stopSpeechToText();
      // Only update answer if there's meaningful content
      if (userAnswer?.length > 10) {
        UpdateUserAnswer();
      }
    } catch (err) {
      toast.error(`Failed to stop recording: ${err.message}`);
    }
  }, [stopSpeechToText, userAnswer]);

  // const UpdateUserAnswer = async () => {
  //   if (!userAnswer?.trim()) {
  //     toast.error('No answer recorded');
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     const feedbackPrompt = `Question: ${mockInterviewQuestion[activeQuestionIndex]?.question}\nUser Answer: ${userAnswer}\nPlease provide rating and feedback for this interview answer in JSON format with 'rating' and 'feedback' fields, focusing on areas of improvement in 3-5 lines.`;

  //     const result = await chatSession.sendMessage(feedbackPrompt);
  //     const mockJsonResp = result.response
  //       .text()
  //       .replace('```json', '')
  //       .replace('```', '')
  //       .trim();

  //     const JsonFeedbackResp = JSON.parse(mockJsonResp);

  //     await db.insert(UserAnswer).values({
  //       mockIdRef: interviewData?.mockId,
  //       question: mockInterviewQuestion[activeQuestionIndex]?.question,
  //       correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
  //       userAns: userAnswer,
  //       feedback: JsonFeedbackResp?.feedback,
  //       rating: JsonFeedbackResp?.rating,
  //       userEmail: user?.primaryEmailAddress?.emailAddress,
  //       createdAt: moment().format('DD-MM-yyyy'),
  //       language: selectedLanguage,
  //     });

  //     toast.success('Answer recorded successfully');
  //     setUserAnswer('');
  //     setResults([]);
  //   } catch (err) {
  //     toast.error(`Failed to update answer: ${err.message}`);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const UpdateUserAnswer = async () => {
    if (!userAnswer?.trim()) {
      toast.error('No answer recorded');
      return;
    }

    setLoading(true);
    setIsProcessing(true); // Add this

    try {
      // Add language-specific instructions
      const languageInstructions = {
        'ko-KR': '피드백을 한국어로 제공해주세요',
        'en-US': 'Provide feedback in English',
        'ja-JP': 'フィードバックを日本語で提供してください',
        'zh-CN': '请用中文提供反馈',
      };

      const feedbackPrompt = `
        Question: ${mockInterviewQuestion[activeQuestionIndex]?.question}
        User Answer: ${userAnswer}
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
        userAns: userAnswer,
        feedback: JsonFeedbackResp?.feedback,
        rating: JsonFeedbackResp?.rating,
        userEmail: user?.primaryEmailAddress?.emailAddress,
        createdAt: moment().format('DD-MM-yyyy'),
        language: selectedLanguage,
      });
      if (resp) {
        toast.success('Answer recorded successfully');
        setUserAnswer('');
        setResults([]);
      }
    } catch (err) {
      toast.error(`Failed to update answer: ${err.message}`);
    } finally {
      setLoading(false);
      setIsProcessing(false); // Add this
      setResults([]);
    }
  };

  return (
    <div className='flex items-center justify-center flex-col'>
      <div className='flex flex-col gap-4 w-full max-w-xl mb-6'>
        <div className='flex justify-between items-center'>
          <h3 className='text-lg font-medium'>{t('recordingSettings')}</h3>
          <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className='w-[180px]'>
              <SelectValue placeholder='Select Language' />
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

        {error && (
          <div className='p-2 text-sm text-red-500 bg-red-50 rounded'>
            Error: {error.message}
          </div>
        )}
      </div>

      <div className='relative flex flex-col items-center bg-black rounded-lg p-5'>
        {/* <Image
          src='/webcam.png'
          width={200}
          height={200}
          alt='Webcam overlay'
          className='absolute'
        /> */}
        <Webcam
          mirrored={true}
          className='z-10 rounded-lg'
          style={{ width: 500 }}
        />
      </div>

      <Button
        disabled={loading}
        variant='outline'
        className='my-10'
        onClick={isRecording ? stopRecording : startRecording}
      >
        {isRecording ? (
          <span className='text-red-600 animate-pulse flex gap-2 items-center'>
            <StopCircle />
            멈추기
          </span>
        ) : (
          <span className='text-primary flex gap-2 items-center'>
            <Mic />
            녹화 시작
          </span>
        )}
      </Button>

      {/* {(interimResult || userAnswer) && (
        <div className='w-full max-w-xl p-4 bg-gray-50 rounded-lg'>
          <h4 className='font-medium mb-2'>{t('transcription')}</h4>
          <p className='text-gray-700'>
            {interimResult ? (
              <span className='opacity-70'>{interimResult}</span>
            ) : (
              userAnswer
            )}
          </p>
        </div>
      )} */}
      <div className='w-full max-w-xl p-4 bg-gray-50 rounded-lg'>
        <h4 className='font-medium mb-2'>{t('transcription')}</h4>
        <p className='text-gray-700 whitespace-pre-wrap'>{displayText}</p>
      </div>
    </div>
  );
}

export default RecordAnswerSection;
