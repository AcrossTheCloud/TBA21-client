export const validateURL = (url: string): boolean => {
  return /^(http|ftp|sftp)(s)?:\/\/?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]%@!$&'()*+,;=.]+$/i.test(url);
};
