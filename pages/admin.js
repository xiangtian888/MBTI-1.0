import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export default function Admin() {
  const [testResults, setTestResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    mbtiType: '',
    zodiacSign: ''
  });

  // MBTI类型和星座选项
  const mbtiTypes = [
    'INFP', 'ENFP', 'INFJ', 'ENFJ', 'INTJ', 'ENTJ', 'INTP', 'ENTP',
    'ISFP', 'ESFP', 'ISTP', 'ESTP', 'ISFJ', 'ESFJ', 'ISTJ', 'ESTJ'
  ];
  
  const zodiacSigns = [
    '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座',
    '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'
  ];

  useEffect(() => {
    // 从 localStorage 获取测试结果，并添加时间戳
    const results = JSON.parse(localStorage.getItem('mbtiResults') || '[]')
      .map(result => ({
        ...result,
        timestamp: result.timestamp || new Date().toISOString() // 为旧数据添加默认时间戳
      }));
    setTestResults(results);
    setFilteredResults(results);
  }, []);

  // 处理筛选条件变化
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    
    // 应用筛选
    let filtered = [...testResults];
    
    if (newFilters.startDate) {
      filtered = filtered.filter(result => 
        new Date(result.timestamp) >= new Date(newFilters.startDate)
      );
    }
    
    if (newFilters.endDate) {
      filtered = filtered.filter(result => 
        new Date(result.timestamp) <= new Date(newFilters.endDate)
      );
    }
    
    if (newFilters.mbtiType) {
      filtered = filtered.filter(result => 
        result.mbtiType === newFilters.mbtiType
      );
    }
    
    if (newFilters.zodiacSign) {
      filtered = filtered.filter(result => 
        result.zodiacSign === newFilters.zodiacSign
      );
    }
    
    setFilteredResults(filtered);
  };

  // 格式化日期显示
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 导出Excel功能
  const exportToExcel = () => {
    // 准备数据
    const exportData = filteredResults.map(result => ({
      '测试时间': formatDate(result.timestamp),
      '姓名': result.name,
      '性别': result.gender,
      '手机号码': result.phone,
      'MBTI类型': result.mbtiType,
      '星座': result.zodiacSign,
      '推荐岗位': result.recommendation?.jobs?.join('、') || '',
      '岗位说明': result.recommendation?.desc || ''
    }));

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // 设置列宽
    const colWidths = [
      { wch: 20 },  // 测试时间
      { wch: 10 },  // 姓名
      { wch: 6 },   // 性别
      { wch: 15 },  // 手机号码
      { wch: 10 },  // MBTI类型
      { wch: 10 },  // 星座
      { wch: 30 },  // 推荐岗位
      { wch: 50 }   // 岗位说明
    ];
    ws['!cols'] = colWidths;

    // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, 'MBTI测试结果');

    // 导出文件
    XLSX.writeFile(wb, `MBTI测试结果_${new Date().toLocaleDateString()}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">MBTI测试结果管理</h1>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
              transition-colors duration-200 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            <span>导出Excel</span>
          </button>
        </div>

        {/* 筛选条件 */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                开始日期
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                结束日期
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                MBTI类型
              </label>
              <select
                name="mbtiType"
                value={filters.mbtiType}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">全部</option>
                {mbtiTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                星座
              </label>
              <select
                name="zodiacSign"
                value={filters.zodiacSign}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">全部</option>
                {zodiacSigns.map(sign => (
                  <option key={sign} value={sign}>{sign}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 结果表格 */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    测试时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    姓名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    性别
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    手机号码
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MBTI类型
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    星座
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    推荐岗位
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResults.map((result, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(result.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.gender}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.mbtiType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {result.zodiacSign}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>{result.recommendation?.jobs?.join('、')}</div>
                      <div className="text-gray-500 text-xs mt-1">
                        {result.recommendation?.desc}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 