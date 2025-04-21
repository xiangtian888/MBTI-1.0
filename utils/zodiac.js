export function getZodiac(month, day) {
  const zodiacs = [
    ["摩羯座", 20], ["水瓶座", 19], ["双鱼座", 20], ["白羊座", 20], ["金牛座", 21], ["双子座", 21],
    ["巨蟹座", 22], ["狮子座", 23], ["处女座", 23], ["天秤座", 23], ["天蝎座", 23], ["射手座", 22], ["摩羯座", 31]
  ];
  return day < zodiacs[month - 1][1] ? zodiacs[month - 1][0] : zodiacs[month][0];
} 