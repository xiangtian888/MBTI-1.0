export const ProgressBar = ({ current, total }) => {
  const percentage = (current / total) * 100;
  return (
    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
      <div 
        className="h-full bg-blue-500 transition-all duration-500" 
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}; 