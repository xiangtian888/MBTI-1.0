export const UserForm = ({ formData, onChange, onSubmit }) => (
  <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
    <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">基本信息</h2>

    <div className="space-y-6">
      {/* 姓名输入框 */}
      <div className="flex flex-col">
        <label className="text-base font-medium text-gray-700 mb-2">
          姓名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          placeholder="请输入姓名"
          value={formData.name}
          onChange={onChange}
          className="w-full p-3 bg-white border border-gray-300 rounded-lg 
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-200 text-base"
          required
        />
      </div>

      {/* 性别单选框 */}
      <div className="flex flex-col">
        <label className="text-base font-medium text-gray-700 mb-2">
          性别 <span className="text-red-500">*</span>
        </label>
        <div className="flex space-x-8">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="男"
              checked={formData.gender === "男"}
              onChange={onChange}
              className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
              required
            />
            <span className="ml-2 text-base text-gray-700">男</span>
          </label>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="女"
              checked={formData.gender === "女"}
              onChange={onChange}
              className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
              required
            />
            <span className="ml-2 text-base text-gray-700">女</span>
          </label>
        </div>
      </div>

      {/* 出生日期选择器 */}
      <div className="flex flex-col">
        <label className="text-base font-medium text-gray-700 mb-2">
          出生日期 <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          name="birth"
          value={formData.birth}
          onChange={onChange}
          className="w-full p-3 bg-white border border-gray-300 rounded-lg 
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-200 text-base text-gray-700"
          required
        />
      </div>

      {/* 手机号码输入框 */}
      <div className="flex flex-col">
        <label className="text-base font-medium text-gray-700 mb-2">
          手机号码 <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          name="phone"
          placeholder="请输入11位手机号码"
          value={formData.phone}
          onChange={onChange}
          pattern="[0-9]{11}"
          className="w-full p-3 bg-white border border-gray-300 rounded-lg 
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-200 text-base"
          required
        />
      </div>

      {/* 下一步按钮 */}
      <button
        type="submit"
        onClick={onSubmit}
        className="w-full mt-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 
          text-white text-lg font-medium rounded-xl shadow-lg 
          hover:from-blue-600 hover:to-blue-700 
          focus:outline-none focus:ring-4 focus:ring-blue-200 
          transition-all duration-300 transform hover:scale-[1.02]"
      >
        下一步
      </button>
    </div>
  </div>
); 