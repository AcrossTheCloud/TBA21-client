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
      authorisation = userGroup ? { authorisation: userGroup, isAuthenticated: true } : { isAuthenticated: true };

    return authorisation;
  } catch (e) {
    return { isAuthenticated: false };
  }
};
