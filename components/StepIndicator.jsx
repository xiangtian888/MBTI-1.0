import React from 'react';

export const StepIndicator = ({ currentStep }) => {
  const steps = [
    { number: 1, label: '基本信息' },
    { number: 2, label: 'MBTI测评' },
    { number: 3, label: '测试结果' }
  ];

  const percentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* 进度条 */}
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-8">
        <div 
          className="h-full bg-blue-500 transition-all duration-500 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* 步骤标签 */}
      <div className="flex justify-between items-center px-2">
        {steps.map((step) => (
          <div 
            key={step.number}
            className={`flex flex-col items-center ${
              step.number <= currentStep ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 
                ${step.number <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-500'}`}
            >
              {step.number}
            </div>
            <span className="text-sm font-medium">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}; 