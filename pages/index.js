import { useState } from 'react';
import { UserForm } from '../components/UserForm';
import { MBTITest } from '../components/MBTITest';
import { calculateMBTI } from '../utils/mbti_calculator';
import { getZodiac } from '../utils/zodiac';
import { jobRecommendation } from '../data/job_recommendation';
import { mbtiQuestions } from '../data/mbti_questions';
import { StepIndicator } from '../components/StepIndicator';

// 自定义提示框组件
const AlertDialog = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <p className="text-gray-800 text-lg mb-6">{message}</p>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    phone: '',
    birth: '',
  });
  const [mbtiAnswers, setMbtiAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleMbtiAnswer = (questionId, value) => {
    setMbtiAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const showAlertMessage = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const handleSubmit = (e) => {
    // 阻止默认的表单提交行为
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (step === 1) {
      if (!formData.name || !formData.gender || !formData.phone || !formData.birth) {
        showAlertMessage('请填写完整个人信息');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      // 检查是否有未完成的题目
      const unansweredQuestions = mbtiQuestions.filter(q => 
        mbtiAnswers[q.id] === undefined || mbtiAnswers[q.id] === null
      );
      
      if (unansweredQuestions.length > 0) {
        showAlertMessage(`还有 ${unansweredQuestions.length} 道题目未完成，请完成所有题目后再提交。`);
        return;
      }

      const birthDate = new Date(formData.birth);
      const zodiacSign = getZodiac(birthDate.getMonth() + 1, birthDate.getDate());
      
      const mbtiResponses = Object.keys(mbtiAnswers).map(id => {
        const question = mbtiQuestions.find(q => q.id === id);
        return {
          value: mbtiAnswers[id],
          dimension: question.dimension,
          reverse: question.reverse
        };
      });

      const mbtiType = calculateMBTI(mbtiResponses);
      const key = `${mbtiType}_${zodiacSign}`;
      
      const resultData = {
        ...formData,
        mbtiType,
        zodiacSign,
        timestamp: new Date().toISOString(),
        recommendation: jobRecommendation[key] || {
          jobs: ["未匹配"],
          desc: "暂时没有匹配到合适的岗位，请等待人工评估。"
        }
      };

      // 保存结果到 localStorage
      const existingResults = JSON.parse(localStorage.getItem('mbtiResults') || '[]');
      localStorage.setItem('mbtiResults', JSON.stringify([...existingResults, resultData]));
      
      setResult(resultData);
      setStep(3);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {showAlert && (
        <AlertDialog
          message={alertMessage}
          onClose={() => setShowAlert(false)}
        />
      )}
      
      <div className="max-w-4xl mx-auto py-8 px-4 sm:py-12 sm:px-6">
        <div className="mb-12">
          <StepIndicator currentStep={step} />
        </div>
        
        <div className="mt-8">
          <form 
            onSubmit={handleSubmit} 
            className="w-full"
            noValidate // 禁用浏览器默认验证
          >
            {step === 1 && (
              <div className="max-w-xl mx-auto">
                <UserForm 
                  formData={formData} 
                  onChange={handleFormChange}
                  onSubmit={handleSubmit}
                />
              </div>
            )}

            {step === 2 && (
              <MBTITest 
                answers={mbtiAnswers} 
                onAnswerChange={handleMbtiAnswer} 
              />
            )}

            {step === 3 && result && (
              <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">测试结果</h2>
                  <p className="text-lg text-gray-600">您的MBTI测试已完成</p>
                </div>
                
                <div className="space-y-6">
                  {/* 基本信息 */}
                  <div className="bg-blue-50 p-6 rounded-xl">
                    <p className="text-xl mb-4">亲爱的 {result.name}：</p>
                    <div className="space-y-2">
                      <p className="text-lg">
                        您的MBTI类型是：
                        <span className="font-semibold text-blue-600 ml-2">{result.mbtiType}</span>
                      </p>
                      <p className="text-lg">
                        您的星座是：
                        <span className="font-semibold text-blue-600 ml-2">{result.zodiacSign}</span>
                      </p>
                    </div>
                  </div>

                  {/* MBTI性格特征 */}
                  <div className="bg-green-50 p-6 rounded-xl">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">MBTI性格类型</h3>
                    <div className="space-y-3">
                      <p className="text-lg">
                        您的MBTI类型是：<span className="font-semibold text-green-600">{result.mbtiType}</span>
                      </p>
                      <p className="text-base text-gray-700">
                        性格特征：
                        {result.mbtiType === 'INFP' && '理想主义者、富有同情心、创造力强、重视内在和谐'}
                        {result.mbtiType === 'ENFP' && '热情活泼、富有创意、关心他人、充满可能性'}
                        {result.mbtiType === 'INFJ' && '富有洞察力、理想主义、注重意义、有同理心'}
                        {result.mbtiType === 'ENFJ' && '温暖热情、有感染力、负责任、善解人意'}
                        {result.mbtiType === 'INTJ' && '战略思维、独立自主、有远见、追求完美'}
                        {result.mbtiType === 'ENTJ' && '果断坚定、领导能力强、战略性思维、追求效率'}
                        {result.mbtiType === 'INTP' && '逻辑思维、创新求知、分析能力强、追求真理'}
                        {result.mbtiType === 'ENTP' && '创新思维、机智灵活、善于辩论、充满活力'}
                        {result.mbtiType === 'ISFP' && '艺术气质、灵活随和、注重体验、热爱自由'}
                        {result.mbtiType === 'ESFP' && '活力四射、随和友善、实际性强、享受当下'}
                        {result.mbtiType === 'ISTP' && '灵活机敏、冷静理性、实践能力强、独立自主'}
                        {result.mbtiType === 'ESTP' && '灵活果断、冒险精神、实践导向、享受刺激'}
                        {result.mbtiType === 'ISFJ' && '温暖细心、负责任、传统务实、关心他人'}
                        {result.mbtiType === 'ESFJ' && '友善热心、责任感强、重视和谐、善于照顾他人'}
                        {result.mbtiType === 'ISTJ' && '严谨负责、实际可靠、注重细节、遵守传统'}
                        {result.mbtiType === 'ESTJ' && '果断务实、有组织、重视效率、遵守规则'}
                      </p>
                    </div>
                  </div>

                  {/* 星座特征 */}
                  <div className="bg-purple-50 p-6 rounded-xl">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">星座特征</h3>
                    <div className="space-y-3">
                      <p className="text-lg">
                        您的星座是：<span className="font-semibold text-purple-600">{result.zodiacSign}</span>
                      </p>
                      <p className="text-base text-gray-700">
                        星座特征：
                        {result.zodiacSign === '白羊座' && '充满活力、勇敢果断、富有领导力、直率热情'}
                        {result.zodiacSign === '金牛座' && '稳重可靠、意志坚定、注重实际、追求美好生活'}
                        {result.zodiacSign === '双子座' && '思维敏捷、善于沟通、好奇心强、灵活多变'}
                        {result.zodiacSign === '巨蟹座' && '情感丰富、重视家庭、富有同情心、保护欲强'}
                        {result.zodiacSign === '狮子座' && '自信阳光、领导能力强、慷慨大方、创造力强'}
                        {result.zodiacSign === '处女座' && '细心谨慎、追求完美、分析能力强、实际理性'}
                        {result.zodiacSign === '天秤座' && '优雅和谐、追求公平、善于交际、审美能力强'}
                        {result.zodiacSign === '天蝎座' && '洞察力强、意志坚定、富有激情、重视忠诚'}
                        {result.zodiacSign === '射手座' && '乐观开朗、追求自由、思想开放、富有冒险精神'}
                        {result.zodiacSign === '摩羯座' && '务实稳重、目标明确、责任心强、追求成就'}
                        {result.zodiacSign === '水瓶座' && '独特创新、人道主义、思维前卫、追求理想'}
                        {result.zodiacSign === '双鱼座' && '富有同情心、想象力丰富、敏感细腻、艺术气质'}
                      </p>
                    </div>
                  </div>

                  {/* 提醒信息 */}
                  <div className="mt-8 p-6 border-2 border-blue-200 rounded-xl bg-blue-50">
                    <p className="text-center text-lg text-blue-800">
                      我们已经收到您的测评结果，请等待工作人员与您联系。
                    </p>
                    <p className="text-center text-base text-blue-600 mt-2">
                      如有任何问题，请保存此页面截图，并联系我们的客服人员。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
} 