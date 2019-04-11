import { Auth } from 'aws-amplify';
import { ICredentials } from 'aws-amplify/lib/Common/types/types';

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

    if (userGroup && userGroup.length) {
      userGroup.forEach( (group: string)  => {
        authList[group] = true;
      });
    }

    return Object.keys(authList).length ? { authorisation: authList, isAuthenticated: true } : { isAuthenticated: true };
  } catch (e) {
    if (e !== 'not authenticated') {
      console.log('checkAuth -- ERROR -- ', e);
    }

    return { isAuthenticated: false };
  }
};

export const getCurrentCredentials = async () => {
  try {
    const credentials: ICredentials = await Auth.currentCredentials();
    return credentials;
  } catch (e) {
    return false;
  }
};
