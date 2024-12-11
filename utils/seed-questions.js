// utils/seed-questions.js
export const questions = [
  // BEHAVIORAL QUESTIONS
  {
    questionId: 'beh-001',
    translations: {
      en: {
        question:
          'Tell me about a time when you had to deal with a difficult team member.',
        sampleAnswer:
          'I once worked with a team member who consistently missed deadlines and was reluctant to communicate. Instead of escalating immediately, I initiated one-on-one meetings to understand their challenges. I discovered they were overwhelmed with multiple projects. Together, we created a prioritization system and set up regular check-ins. Within two months, their performance improved significantly and our team collaboration strengthened.',
        tips: 'Focus on how you resolved the conflict constructively. Emphasize communication and positive outcomes. Avoid speaking negatively about the other person.',
      },
      ko: {
        question: '어려운 팀원을 다뤄야 했던 경험에 대해 말씀해주세요.',
        sampleAnswer:
          '한번 마감일을 자주 놓치고 의사소통을 꺼리는 팀원과 일한 적이 있습니다. 즉시 상부에 보고하는 대신, 일대일 미팅을 통해 그들의 어려움을 이해하려 했습니다. 여러 프로젝트로 인해 부담을 느끼고 있다는 것을 알게 되었고, 함께 우선순위 시스템을 만들고 정기적인 체크인을 설정했습니다. 2개월 내에 그들의 성과가 크게 향상되었고 팀 협업도 강화되었습니다.',
        tips: '갈등을 건설적으로 해결한 방법에 중점을 두세요. 의사소통과 긍정적인 결과를 강조하세요. 상대방에 대해 부정적으로 말하는 것을 피하세요.',
      },
    },
    category: 'behavioural',
    difficulty: 'medium',
    experienceLevel: 'all',
    commonFor: ['All roles'],
    popularity: 95,
  },
  {
    questionId: 'beh-002',
    translations: {
      en: {
        question:
          'Describe a situation where you had to meet a tight deadline. How did you handle it?',
        sampleAnswer:
          'During a critical product launch, we faced an unexpected requirement change two weeks before the deadline. I immediately assessed the impact and reorganized our priorities. I implemented daily stand-ups to track progress, identified tasks that could be done in parallel, and coordinated with other teams for additional support. We not only met the deadline but also delivered a higher quality product than initially planned.',
        tips: 'Emphasize your time management and organizational skills. Explain your prioritization process. Highlight the successful outcome and any lessons learned.',
      },
      ko: {
        question:
          '촉박한 마감시간을 맞춰야 했던 상황과 어떻게 대처했는지 설명해주세요.',
        sampleAnswer:
          '중요한 제품 출시 중, 마감 2주 전에 예상치 못한 요구사항 변경에 직면했습니다. 즉시 영향을 평가하고 우선순위를 재조정했습니다. 진행 상황을 추적하기 위해 일일 스탠드업을 실시하고, 병렬로 처리할 수 있는 작업을 파악하고, 추가 지원을 위해 다른 팀과 협조했습니다. 마감시간을 맞췄을 뿐만 아니라 처음 계획했던 것보다 더 높은 품질의 제품을 제공했습니다.',
        tips: '시간 관리와 조직력을 강조하세요. 우선순위 설정 과정을 설명하세요. 성공적인 결과와 배운 교훈을 강조하세요.',
      },
    },
    category: 'behavioural',
    difficulty: 'medium',
    experienceLevel: 'all',
    commonFor: ['All roles'],
    popularity: 92,
  },

  // SITUATIONAL QUESTIONS
  {
    questionId: 'sit-001',
    translations: {
      en: {
        question:
          "If you noticed a colleague taking credit for someone else's work, what would you do?",
        sampleAnswer:
          'I would first document the situation with specific examples. Then, I would have a private conversation with my colleague to understand if there was a misunderstanding. If the behavior continued, I would discuss the situation with my supervisor, focusing on maintaining team morale and ensuring fair recognition of contributions. Throughout the process, I would maintain professionalism and avoid creating team conflict.',
        tips: 'Show your commitment to fairness and professionalism. Emphasize diplomatic problem-solving. Demonstrate your ability to handle sensitive situations.',
      },
      ko: {
        question:
          '동료가 다른 사람의 업무 성과를 가로채는 것을 발견했다면 어떻게 하시겠습니까?',
        sampleAnswer:
          '먼저 구체적인 예시와 함께 상황을 문서화할 것입니다. 그런 다음, 동료와 개별적으로 대화하여 오해가 있었는지 확인할 것입니다. 행동이 계속된다면, 팀 사기를 유지하고 공정한 기여도 인정을 보장하는데 중점을 두고 상사와 상황을 논의할 것입니다. 전 과정에서 전문성을 유지하고 팀 갈등을 만들지 않도록 할 것입니다.',
        tips: '공정성과 전문성에 대한 귀하의 의지를 보여주세요. 외교적인 문제 해결을 강조하세요. 민감한 상황을 처리하는 능력을 보여주세요.',
      },
    },
    category: 'situational',
    difficulty: 'hard',
    experienceLevel: 'mid',
    commonFor: ['All roles'],
    popularity: 88,
  },
  // Add more behavioral and situational questions...
];
