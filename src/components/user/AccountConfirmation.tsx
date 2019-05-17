import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { Auth } from 'aws-amplify';
import { has, get } from 'lodash';
import { Alert, Button, FormGroup, Input, Label } from 'reactstrap';

import LoaderButton from 'components/utils/LoaderButton';

// Extends RouteComponentProps from the router, allows you to pass in History to props through withRouter
// Instead of passing in down the hierarchy from router.tsx
interface Props extends RouteComponentProps {
  email: string;
  sentCode?: boolean | undefined;
}

interface State {
  email: string | undefined;
  errorMessage: string | undefined;
  isLoading: boolean;
  hasResentCode: boolean;
  confirmationCode: string;
}

class AccountConfirmationClass extends React.Component<Props, State>  {
  matchEmail;

  constructor(props: Props) {
    super(props);

    this.matchEmail = has(props.match, 'params.email') ? get(props.match, 'params.email') : undefined;

    this.state = {
      email: this.matchEmail,
      errorMessage: undefined,
      isLoading: false,
      hasResentCode: false,
      confirmationCode: '',
    };
  }

  componentDidMount(): void {
    if (!this.matchEmail && !this.props.email) {
      this.props.history.push('/');
    } else {
      this.setState({ email: this.matchEmail ? this.matchEmail : this.props.email});
    }
  }

  /**
   * Checks for whitespace and if the confirmation code isn't empty.
   */
  validateConfirmationForm() {
    const hasWhitespace = /\s/.test(this.state.confirmationCode);
    return this.state.confirmationCode.length > 0 && !hasWhitespace;
  }

  /**
   *
   * API call to Cognitio check the if the given confirmation code is correct.
   *
   * @param event {React.FormEvent} Mouse click
   */
  handleConfirmationSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (this.state.email) {
      this.setState({isLoading: true, errorMessage: undefined});

      try {
        await Auth.confirmSignUp(this.state.email, this.state.confirmationCode);

        // We push to / and then to login to make the /login re-render as it's state is set to notConfirmed :)
        // Probably a better way to do this.
        this.props.history.push('/');
        this.props.history.push('/login');
      } catch (e) {
        let errorMessage: string | undefined = undefined;

        if (e.code === 'NotAuthorizedException') {
          errorMessage = 'Your account is already confirmed.';
        }
        if (e.code === 'CodeMismatchException' || e.code === 'InvalidParameterException') {
          errorMessage = 'Incorrect code.';
        }
        this.setState({isLoading: false, errorMessage: errorMessage});
      }
    }
  }

  /**
   * Resend confirmation code API call
   */
  resendConfirmationCode = async () => {
    if (this.state.email) {
      try {
        this.setState({hasResentCode: true});
        await Auth.resendSignUp(this.state.email);
      } catch (e) {
        // NOTE
        // We get InvalidParameterException if the user is signed up, documentation on responses is non-existent
        if (e.code === 'UserNotFoundException') {
          this.setState({errorMessage: 'Looks like there\'s no account with this email address.'});
        } else {
          this.setState( { errorMessage: `We're unable to confirm your account due to an error, please contact us. (${e.code})` });
        }
      }
    }
  }

  render() {
    return (
      <>
        {this.state.errorMessage ? <Alert color="danger">{this.state.errorMessage}</Alert> : <></>}
        <form onSubmit={this.handleConfirmationSubmit}>
          <FormGroup id="confirmationCode">
            <Label>Confirmation Code</Label>
            <Input
              autoFocus
              type="tel"
              value={this.state.confirmationCode}
              onChange={(e) => this.setState({confirmationCode: e.target.value})}
            />
            Please check your email for the code{this.state.hasResentCode || this.props.sentCode ? '.' : <> or <Button color="link" onClick={this.resendConfirmationCode}>resend the code</Button>.</>}
          </FormGroup>
          <LoaderButton
            block
            disabled={!this.validateConfirmationForm()}
            type="submit"
            isLoading={this.state.isLoading}
            text="Verify"
            loadingText="Verifying…"
          />
        </form>
      </>
    );
  }
}

// Passes in history for us :)
export const AccountConfirmation = withRouter(AccountConfirmationClass);
