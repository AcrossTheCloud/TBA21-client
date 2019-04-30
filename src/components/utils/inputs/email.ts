/**
 *
 * Tests to see if an email address is valid.
 *
 * @param emailAddress {string}
 * @returns {boolean}
 */
export const validateEmail = (emailAddress: string) => {
  const  emailRexeg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRexeg.test(emailAddress);
};
