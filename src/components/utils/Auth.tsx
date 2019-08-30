import { Auth } from 'aws-amplify';
import { CognitoUser } from 'amazon-cognito-identity-js';
import { ICredentials } from 'aws-amplify/lib/Common/types/types';
import { get } from 'lodash';

export interface AuthorisationList {
  [key: string]: boolean;
}
// export interface Attributes {
//   email
// }
export interface Authorisation {
  isAuthenticated: boolean;
  authorisation?: AuthorisationList;
  uuid: string;
  email: string;
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
export const checkAuth = async (bypassCache: boolean = false): Promise<Authorisation> => {
  try {
    const currentUser = await Auth.currentAuthenticatedUser({ bypassCache: bypassCache });
    if (currentUser) {
      const
        userGroups = get(currentUser, 'signInUserSession.idToken.payload.cognito:groups'),
        authorisation = {};

      if (userGroups && userGroups.length) {
        userGroups.forEach( (group: string)  => {
          authorisation[group] = true;
        });
      }
      const uuid = currentUser.getUsername();
      const email = get(currentUser, 'attributes.email');

      console.log('email', email, currentUser);

      return Object.keys(authorisation).length ? { authorisation: authorisation, isAuthenticated: true, uuid, email } : { isAuthenticated: true, uuid, email };
    } else {
      return { isAuthenticated: false, email: '', uuid: '' };
    }
  } catch (e) {
    if (e !== 'not authenticated') {
      console.log('checkAuth -- ERROR -- ', e);
    }

    return { isAuthenticated: false, email: '', uuid: '' };
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
 * Gets the current Authed user from AWS-Amplify, this returns tokens such as AccessToken
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
