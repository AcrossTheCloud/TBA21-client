import { Auth } from 'aws-amplify';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { ICredentials } from 'aws-amplify/lib/Common/types/types';
import { get } from 'lodash';

export interface AuthorisationList {
  [key: string]: boolean;
}
export interface Authorisation {
  isAuthenticated: boolean;
  authorisation?: AuthorisationList;
}

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
export const checkAuth = async (): Promise<Authorisation> => {
  try {
    const
      userGroups = get(await Auth.currentAuthenticatedUser(), 'signInUserSession.idToken.payload.cognito:groups'),
      authorisation = {};

    if (userGroups && userGroups.length) {
      userGroups.forEach( (group: string)  => {
        authorisation[group] = true;
      });
    }
    return Object.keys(authorisation).length ? { authorisation: authorisation, isAuthenticated: true } : { isAuthenticated: true };
  } catch (e) {
    if (e !== 'not authenticated') {
      console.log('checkAuth -- ERROR -- ', e);
    }

    return { isAuthenticated: false };
  }
};

export const getCurrentCredentials = async (): Promise<ICredentials | boolean> => {
  try {
    return await Auth.currentCredentials();
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
    return await Auth.currentAuthenticatedUser({ bypassCache });
  } catch (e) {
    return false;
  }
};
