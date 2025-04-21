import { LikertScale } from './LikertScale';

export const QuestionCard = ({ question, value, onChange }) => (
  <div className="w-full">
    <p className="text-xl font-medium text-gray-800 text-center mb-8">
      {question.text}
    </p>
    <LikertScale value={value} onChange={onChange} />
  </div>
); 