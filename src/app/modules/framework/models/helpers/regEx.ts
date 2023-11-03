export const regEx = {
  nameAr: /^(([^-\s]))/,
  nameEn: /^(([^-\s]))/,
  ArabicAndEnglishLettersOnly: '[a-zA-Z\u0600-\u06FF ]*',
  NoSpecialCharacters: '[0-9]*[a-zA-Z\u0600-\u06FF][a-zA-Z\u0600-\u06FF0-9]*',
  phone: '^(\\+[0-9]{2,4}-)[0-9]{9,10}$',
  // ************* don't use 'theRedEx' ** but use /^((theRedEx))/ *************
  email: /^(([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{1,}))$/,
  numbers: '^[0-9]{0,50}$',
  precentage: '^100(\\.0{0,2}?)?$|^\\d{0,2}(\\.\\d{0,2})?$',
  DecimalNumberExceptNegativeNumber: '^0||(\\d*[1-9]\\d*(\\.[0-9]*)?|0*\\.\\d*[1-9]\\d*)$',
  noSpacesOnly: /^((\s*)[a-zA-Z0-9_](\s*))+$/,
  saPhoneNumber: /^(009665|9665|\+9665|05|5)(5|0|3|6|4|9|1|8|7)([0-9]{7})$/,
  integerNumber: /^[0-9]\d*$/
};
