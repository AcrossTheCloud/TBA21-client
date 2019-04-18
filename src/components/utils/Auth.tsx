import { Auth } from 'aws-amplify';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { ICredentials } from 'aws-amplify/lib/Common/types/types';
import { get } from 'lodash';

/**
 * Log the user out using AWS Amplify
 */
export const logout = async () => {
  try {
    await Auth.signOut();

    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Checks the authentication status of the user and the user group they belong to
 * @return Object, {authorisation {Array<string>}, isAuthenticated {boolean}}
 */
export const checkAuth = async () => {
  try {
    const
      userGroup = get(await Auth.currentAuthenticatedUser(), 'signInUserSession.idToken.payload.cognito:groups'),
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

/**
 *
 * Gets the currentAuthed user from AWS-Amplify, this returns tokens such as AccessToken
 *
 * @param bypassCache {boolean}
 *
 * @returns {boolean} or {CognitoUser | any}
 */
export const getCurrentAuthenticatedUser = async (bypassCache: boolean = false): Promise<CognitoUser | boolean> => {
  try {
    const credentials: any = await Auth.currentAuthenticatedUser({ bypassCache }); // tslint:disable-line: no-any
    return credentials;
  } catch (e) {
    return false;
  }
};
