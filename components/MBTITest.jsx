import { useState } from 'react';
import { mbtiQuestions } from '../data/mbti_questions';
import { QuestionCard } from './QuestionCard';

export const MBTITest = ({ answers, onAnswerChange }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const totalQuestions = mbtiQuestions.length;
  const answeredCount = Object.keys(answers).length;
  
  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  // 简化答案记录逻辑，只记录答案，不做其他处理
  const handleAnswerChange = (questionId, value) => {
    onAnswerChange(questionId, value);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* 进度条 - 静默更新，不提示 */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
        <div className="flex justify-between items-center text-sm font-medium text-gray-600 mb-4">
          <span>测试进度</span>
          <span className="text-blue-600">{answeredCount}/{totalQuestions}</span>
        </div>
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* 问题卡片 */}
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 mb-6">
        <div className="text-center mb-2">
          <span className="text-sm font-medium text-gray-500">
            问题 {currentQuestion + 1} / {totalQuestions}
          </span>
        </div>
        <QuestionCard
          key={mbtiQuestions[currentQuestion].id}
          question={mbtiQuestions[currentQuestion]}
          value={answers[mbtiQuestions[currentQuestion].id]}
          onChange={(value) => handleAnswerChange(mbtiQuestions[currentQuestion].id, value)}
        />
      </div>

      {/* 导航按钮 */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={handlePrev}
          className={`flex-1 py-4 rounded-xl text-lg font-medium transition-all duration-200
            ${currentQuestion === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
            }`}
          disabled={currentQuestion === 0}
        >
          上一题
        </button>
        
        {currentQuestion < totalQuestions - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 py-4 rounded-xl text-lg font-medium transition-all duration-200
              bg-gradient-to-r from-blue-500 to-blue-600 text-white 
              hover:from-blue-600 hover:to-blue-700"
          >
            下一题
          </button>
        ) : (
          <button
            type="submit"
            className="flex-1 py-4 rounded-xl text-lg font-medium transition-all duration-200
              bg-gradient-to-r from-blue-500 to-blue-600 text-white 
              hover:from-blue-600 hover:to-blue-700"
          >
            提交测试
          </button>
        )}
      </div>
    </div>
  );
}; 