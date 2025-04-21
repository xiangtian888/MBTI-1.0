# MBTI职业测评系统

基于 MBTI 性格类型和星座的职业推荐系统，帮助用户找到最适合的职业方向。

## 功能特点

- 📝 完整的 MBTI 性格测试
- 🌟 结合星座特征分析
- 💼 精准的职业匹配推荐
- 📊 后台数据管理系统
- 📈 数据导出功能
- 💫 美观的用户界面

## 技术栈

- **前端框架**: Next.js
- **UI 框架**: Tailwind CSS
- **状态管理**: React Hooks
- **数据存储**: LocalStorage
- **开发语言**: JavaScript/JSX

## 项目结构

```
MBTI-1.0/
├── components/          # React 组件
│   ├── LikertScale     # 李克特量表组件
│   ├── MBTITest        # MBTI测试组件
│   ├── QuestionCard    # 问题卡片组件
│   ├── StepIndicator   # 步骤指示器
│   └── UserForm        # 用户信息表单
├── data/               # 数据文件
│   ├── mbti_questions  # MBTI问题库
│   └── job_recommendation # 职业推荐数据
├── pages/              # 页面文件
│   ├── index.js        # 主页面
│   └── admin.js        # 管理后台
├── styles/             # 样式文件
└── utils/              # 工具函数
```

## 主要功能

### 1. MBTI 测试
- 16道精心设计的问题
- 李克特七分量表
- 实时进度显示

### 2. 职业匹配
目前支持以下精准匹配：
- 新媒体学徒：ENFP + 双子座
- 人事招募：ESFJ + 巨蟹座
- 项目负责人：ESTJ + 摩羯座

### 3. 管理后台
- 测试结果查看
- 多维度数据筛选
- Excel导出功能

## 安装和运行

1. 克隆项目
```bash
git clone https://github.com/xiangtian888/MBTI-1.0.git
cd MBTI-1.0
```

2. 安装依赖
```bash
npm install
```

3. 运行开发服务器
```bash
npm run dev
```

4. 访问应用
打开浏览器访问 `http://localhost:3000`

## 使用说明

1. 首页填写基本信息
2. 完成 MBTI 测试问卷
3. 获取个性化职业推荐
4. 管理员可通过 `/admin` 查看所有测试结果

## 开发团队

- 项目开发：@xiangtian888

## 更新日志

### v1.0.0
- 完整的 MBTI 测试功能
- 基于 MBTI 和星座的职业推荐
- 后台管理系统
- 数据导出功能

## 许可证

MIT License 