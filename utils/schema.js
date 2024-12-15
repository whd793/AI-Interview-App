import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';

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

// export const QuestionBank = pgTable('questionBank', {
//   id: serial('id').primaryKey(),
//   questionId: varchar('questionId').notNull(), // to link translations
//   question: text('question').notNull(),
//   category: varchar('category').notNull(), // behavioural, technical, situational
//   difficulty: varchar('difficulty').notNull(), // easy, medium, hard
//   roleCategory: varchar('roleCategory').notNull(), // frontend, backend, fullstack, all
//   experienceLevel: varchar('experienceLevel').notNull(), // junior, mid, senior
//   commonFor: text('commonFor').notNull(), // JSON array of roles
//   sampleAnswer: text('sampleAnswer').notNull(),
//   tips: text('tips').notNull(),
//   popularity: integer('popularity').notNull(),
//   language: varchar('language').notNull().default('en'),
//   createdAt: varchar('createdAt').notNull(),
// });

// export const SavedQuestions = pgTable('savedQuestions', {
//   id: serial('id').primaryKey(),
//   questionId: integer('questionId').notNull(),
//   userEmail: varchar('userEmail').notNull(),
//   createdAt: varchar('createdAt').notNull(),
// });
