import * as React from 'react';
import { Auth } from 'aws-amplify';
import { Authorisation, checkAuth } from '../components/utils/Auth';

interface State extends Authorisation {
  isLoading: boolean;
}
export interface Props {
  history: any; // tslint:disable-line: no-any
}

const authContextDefaultValues = {
  isLoading: true,
  uuid: '',
  isAuthenticated: false,
  authorisation: {},
  login: (email: string, password: string) => { return; },
  logout: () => { return; },
  facebookLogin: (data: { name: string; email: string; accessToken: string; expiresIn: number; }) => { return; },
};

export const AuthContext = React.createContext(authContextDefaultValues);
export const AuthConsumer = AuthContext.Consumer;
export class AuthProvider extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: true,
      isAuthenticated: false,
      authorisation: {}
    };
  }

  async componentDidMount(): Promise<void> {
    if (!this.state.isAuthenticated) {
      try {
        const auth = await checkAuth(true);
        this.setState(prevState => ({...prevState, ...auth, isLoading: false}));
      } catch (e) {
        await this.logout();
      }
    }
  }

  login = async (email: string, password: string): Promise<void> => {
    if (email && password) {
      try {
        await Auth.signIn(email, password);

        const auth: Authorisation = await checkAuth();
        this.setState({ ...auth });

        this.props.history.push('/');
      } catch (e) {
        throw e;
      }
    } else {
      throw new Error('UserLoginEmailPasswordException');
    }
  }

  logout = async (): Promise<void> => {
    await Auth.signOut();
    // Fail or not, wipe the state.
    this.setState({ isAuthenticated: false, authorisation: {} });
  }

  facebookLogin = async (data: { name: string; email: string; accessToken: string; expiresIn: number; }): Promise<void> => {
    const
      {name, email, accessToken: token, expiresIn} = data,
      expiresAt = expiresIn * 1000 + new Date().getTime(),
      user = {name, email};

    try {
      await Auth.federatedSignIn(
        'facebook',
        {token, 'expires_at': expiresAt},
        user
      );
      const auth: Authorisation = await checkAuth();
      this.setState({ ...auth });
      this.props.history.push('/');

    } catch (e) {
      throw e.message;
    }
  }

  render() {
    return (
      <AuthContext.Provider
        value={{
          isLoading: this.state.isLoading,
          isAuthenticated: this.state.isAuthenticated,
          authorisation: this.state.authorisation ? this.state.authorisation : {},
          uuid: this.state.uuid ? this.state.uuid : '',
          login: this.login,
          logout: this.logout,
          facebookLogin: this.facebookLogin
        }}
      >
        {this.props.children}
      </AuthContext.Provider>
    );
  }
}
