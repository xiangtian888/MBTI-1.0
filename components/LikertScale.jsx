export const LikertScale = ({ value, onChange }) => {
  const options = [3, 2, 1, 0, -1, -2, -3];

  return (
    <div className="mt-8 max-w-4xl mx-auto px-4">
      <div className="relative">
        <div className="flex justify-between mb-8">
          <span className="text-green-500 font-medium text-lg">同意</span>
          <span className="text-purple-500 font-medium text-lg">不同意</span>
        </div>
        <div className="likert-scale">
          <div className="absolute left-0 right-0 h-[1px] top-1/2 -translate-y-1/2 bg-gradient-to-r from-green-200 via-gray-200 to-purple-200"></div>
          <div className="grid grid-cols-7 gap-4">
            {options.map((option) => {
              const isLargest = Math.abs(option) === 3;
              const size = isLargest ? 'w-20 h-20' :
                          Math.abs(option) === 2 ? 'w-16 h-16' :
                          Math.abs(option) === 1 ? 'w-14 h-14' : 'w-12 h-12';

              const isSelected = value === option;
              const isNeutral = option === 0;

              return (
                <div 
                  key={option} 
                  className="flex items-center justify-center"
                >
                  <button
                    type="button"
                    onClick={() => onChange(option)}
                    className={`group relative ${size} rounded-full flex items-center justify-center 
                      transition-all duration-300 transform hover:scale-105
                      ${isSelected 
                        ? isNeutral
                          ? 'bg-gray-400'
                          : option > 0 
                            ? 'bg-green-500' 
                            : 'bg-purple-500'
                        : 'bg-white'
                      } border-2
                      ${isNeutral
                        ? isSelected
                          ? 'border-gray-400'
                          : 'border-gray-300 hover:border-gray-400'
                        : option > 0 
                          ? isSelected
                            ? 'border-green-500' 
                            : 'border-green-300 hover:border-green-400' 
                          : isSelected
                            ? 'border-purple-500'
                            : 'border-purple-300 hover:border-purple-400'
                      }`}
                  >
                    {isSelected && (
                      <svg 
                        className="w-6 h-6 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                          clipRule="evenodd" 
                        />
                      </svg>
                    )}
                    {isNeutral && !isSelected && (
                      <span className="text-gray-400 font-medium">中立</span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}; 