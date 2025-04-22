// 根据环境确定API基础URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://43.138.144.68:3000/api'
  : 'http://localhost:3000/api';

export const saveTestResult = async (resultData) => {
  try {
    console.log('发送数据:', resultData);
    const response = await fetch(`${API_BASE_URL}/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resultData),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '保存失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('保存测试结果失败:', error);
    throw error;
  }
};

export const getAllResults = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/results`, {
      credentials: 'include'
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '获取数据失败');
    }
    return await response.json();
  } catch (error) {
    console.error('获取测试结果失败:', error);
    throw error;
  }
};

export const filterResults = async (filters) => {
  try {
    const response = await fetch(`${API_BASE_URL}/results/filter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '筛选失败');
    }
    
    return await response.json();
  } catch (error) {
    console.error('筛选测试结果失败:', error);
    throw error;
  }
}; 