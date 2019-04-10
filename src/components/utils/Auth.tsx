import { Auth } from 'aws-amplify';

/**
 * Checks the authentication status of the user and the user group they belong to
 * @return Object, {authorisation {Array<string>}, isAuthenticated {boolean}}
 */
export const checkAuth = async () => {
  try {
    const authenticatedUser = await Auth.currentAuthenticatedUser();

    const
      userGroup = ((((authenticatedUser || false).signInUserSession || false).idToken || false).payload || false)['cognito:groups'],
      authList = {};

    userGroup.forEach( (group: string)  => {
      authList[group] = true;
    });

    return Object.keys(authList).length ? { authorisation: authList, isAuthenticated: true } : { isAuthenticated: true };
  } catch (e) {
    return { isAuthenticated: false };
  }
};
