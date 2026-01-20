export const generateOTP = (length = 6): string => {
  return Math.floor(
    Math.pow(10, length - 1) +
    Math.random() * Math.pow(10, length)
  ).toString();
};
