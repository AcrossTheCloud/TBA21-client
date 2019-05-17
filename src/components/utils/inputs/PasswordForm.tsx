import * as React from 'react';
import {
  FormGroup,
  Input,
  Label
} from 'reactstrap';

import * as InputValidation from 'components/utils/inputs/input';

import 'styles/utils/inputs/passwordForm.scss';

interface Props {
  callback: Function;
}

interface State {
  password: string;
  confirmPassword: string;
  passwordsMatch: boolean;

  passwordHasUpperCase: boolean;
  passwordHasLowerCase: boolean;
  passwordHasNumberCase: boolean;
  passwordHasSymbolCase: boolean;
}

export class PasswordForm extends React.Component<Props, State> {
  confirmPasswordTimeout;

  constructor(props: Props) {
    super(props);

    this.state = {
      password: '',
      confirmPassword: '',
      passwordsMatch: false,

      passwordHasUpperCase: false,
      passwordHasLowerCase: false,
      passwordHasNumberCase: false,
      passwordHasSymbolCase: false
    };
  }

  /**
   *
   * Validates the password and returns either and empty string or a message
   *
   * @param password {string}
   */
  validate(password: string): string {
    let errorMessage: string = '';
    const
      passwordToShort: string = 'Password must be at least 8 characters long',
      passwordLength: boolean = password.length >= 8;

    if (!passwordLength) {
      errorMessage = passwordToShort + '.';
    }

    if (!InputValidation.hasUpperCase(password)) {
      errorMessage = passwordLength ? passwordToShort + ' and have one uppercase character' : 'Passwords must contain one uppercase character.';
    }
    if (!InputValidation.hasLowerCase(password)) {
      errorMessage = passwordLength ? passwordToShort + ' and have one lowercase character' : 'Passwords must contain one lowercase character.';
    }
    if (!InputValidation.hasSymbol(password)) {
      errorMessage = passwordLength ? passwordToShort + ' and have one symbol' : 'Passwords must contain one symbol.';
    }
    // Check that we have any lowercase characters
    if (!InputValidation.hasNumber(password)) {
      errorMessage = passwordLength ? passwordToShort + ' and have a number' : 'Passwords must contain a number.';
    }

    return errorMessage;
  }

  /**
   * On change checks validation and sets state
   * Calls callback with results
   * @param password {string}
   */
  onPasswordChange = (password: string) => {
    const passwordsMatch: boolean = (password === this.state.confirmPassword);
    this.setState(
      {
        password: password,
        passwordsMatch: passwordsMatch,
        passwordHasUpperCase: InputValidation.hasUpperCase(password),
        passwordHasLowerCase: InputValidation.hasLowerCase(password),
        passwordHasNumberCase: InputValidation.hasNumber(password),
        passwordHasSymbolCase: InputValidation.hasSymbol(password)
      });

    if (!passwordsMatch && this.state.confirmPassword.length) {
      this.props.callback('', 'Passwords don\'t match');
    } else {
      this.props.callback('', this.validate(password));
    }

  }

  /**
   *
   * Checks passwords match in a timeout and callback the results / validation message
   *
   * @param password {string}
   */
  onConfirmPasswordChange = (password: string) => {
    this.setState({ confirmPassword: password });
    if (this.confirmPasswordTimeout) {
      clearTimeout(this.confirmPasswordTimeout);
    }

    this.confirmPasswordTimeout = setTimeout( () => {
      if (password !== this.state.password) {
        this.setState({ confirmPassword: password, passwordsMatch: false });
        this.props.callback('', 'Passwords don\'t match');
      } else {
        this.setState({ passwordsMatch: true });
        this.props.callback(password, this.validate(password));
      }
    },                                        500);
  }

  render() {
    return (
      <>
        <FormGroup className="passwordForm">
          <Label>Password</Label>
          <Input
            value={this.state.password}
            onChange={e => this.onPasswordChange(e.target.value)}
            type="password"
          />
          <small>
            <span className={this.state.password.length >= 8 ? 'valid' : 'invalid'}>Passwords must have a length of at least 8</span>
            <br />
            <span className={this.state.passwordHasLowerCase ? 'valid' : 'invalid'}>One lower character.</span>
            <br />
            <span className={this.state.passwordHasUpperCase ? 'valid' : 'invalid'}>One uppercase character.</span>
            <br />
            <span className={this.state.passwordHasNumberCase ? 'valid' : 'invalid'}>One number.</span>
            <br />
            <span className={this.state.passwordHasSymbolCase ? 'valid' : 'invalid'}>And one special character / symbol.</span>
          </small>
        </FormGroup>
        <FormGroup id="confirmPassword">
          <Label>Confirm Password</Label>
          <Input
            value={this.state.confirmPassword}
            onChange={e => this.onConfirmPasswordChange(e.target.value)}
            type="password"
            invalid={!this.state.passwordsMatch}
          />
        </FormGroup>
      </>
    );
  }
}
