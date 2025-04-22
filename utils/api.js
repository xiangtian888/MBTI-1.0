const API_BASE_URL = 'http://43.138.144.68:3001/api';

export const saveTestResult = async (resultData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/results`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resultData),
    });
    return await response.json();
  } catch (error) {
    console.error('保存测试结果失败:', error);
    throw error;
  }
};

export const getAllResults = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/results`);
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
    });
    return await response.json();
  } catch (error) {
    console.error('筛选测试结果失败:', error);
    throw error;
  }
}; 