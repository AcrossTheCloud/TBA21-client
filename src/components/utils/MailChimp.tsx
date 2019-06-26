import * as React from 'react';
import { API } from 'aws-amplify';
import { get } from 'lodash';
import { Button, Form, FormGroup, Input, Label, Spinner } from 'reactstrap';
import { getCurrentAuthenticatedUser } from './Auth';
import { Alerts, TimedErrorMessage } from './alerts';

interface SubscriberDetails {
  status: string;
  tags: string[];
}

interface State extends Alerts  {
  allTags: string[];
  subscriberDetails: SubscriberDetails;
  isLoading: boolean;
}

interface Props {
  email: string;
}

export default class MailChimp extends React.Component<Props, State> {
  private _isMounted;

  constructor(props: Props) {
    super(props);

    this._isMounted = false;

    this.state = {
      isLoading: true,
      allTags: [],
      subscriberDetails: {
        status: '',
        tags: []
      }
    };
  }

  async componentDidMount(): Promise<void> {
    this._isMounted = true;

    try {
      const
        allTags = await API.get('tba21', 'mailchimp/getSegments', {}),
        subscriberDetails = await this.getUserTags();

      if (this._isMounted) {
        this.setState({
          allTags: allTags,
          subscriberDetails: subscriberDetails,
          isLoading: false,
          errorMessage: undefined
        });
      }
    } catch (e) {
      if (this._isMounted) {
        this.setState({errorMessage: `We've had a bit of an issue getting our mailing list options for you. Please try again later.`});
      }
    }
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  getUserTags = async (): Promise<SubscriberDetails> => {
    const userDetails = await getCurrentAuthenticatedUser(false);

    return await API.get('tba21', 'mailchimp/getSubscriberTags', {
      queryStringParameters: {
        email: get(userDetails, 'attributes.email')
      }
    });
  }

  checkboxOnChange = async (e: React.ChangeEvent<HTMLInputElement>, tag: string) => {
    if (this._isMounted) {
      this.setState({isLoading: true});
    }

    try {
      const
        { checked } = e.target,
        query = {
          tag: tag,
          uuid: get(await getCurrentAuthenticatedUser(), 'username')
        };
      let { subscriberDetails } = this.state;

      if (checked) {
        await API.post('tba21', 'mailchimp/postSubscriberAddTag', { body: query });
        // Add the tag if it doesn't exist.
        if (!subscriberDetails.tags.includes(tag)) {
          subscriberDetails.tags.push(tag);
        }
      } else {
        await API.del('tba21', 'mailchimp/deleteSubscriberRemoveTag', { queryStringParameters: query });
        // Add the tag if it doesn't exist.
        if (subscriberDetails.tags.includes(tag)) {
          subscriberDetails.tags.splice(subscriberDetails.tags.indexOf(tag), 1);
        }
      }

      if (this._isMounted) {
        this.setState({ isLoading: false, subscriberDetails: subscriberDetails });
      }

    } catch (e) {
      if (this._isMounted) {
        this.setState({ isLoading: false, errorMessage: `Looks like we've had an issue updating your preferences.` });
      }
    }
  }

  subscribeUser = async (): Promise<void> => {
    if (this._isMounted) {
      this.setState({ isLoading: true });
    }

    let
      status = 'unsubscribed',
      responseErrorMessage = undefined;
    try {
      // Returns a boolean if the request was successful or not.
      const response = await API.post('tba21', 'mailchimp/postSubscribeUser', {
        body: {
          uuid: get(await getCurrentAuthenticatedUser(), 'username')
        }
      });

      status = response ? 'subscribed' : 'unsubscribed';
    } catch (e) {
      responseErrorMessage = e;
    } finally {
      if (this._isMounted) {
        this.setState({
          errorMessage: responseErrorMessage,
          subscriberDetails: {
            ...this.state.subscriberDetails,
            status: status
          },
          isLoading: false
        });
      }
    }
  }

  render() {
    const {isLoading, allTags, subscriberDetails, errorMessage} = this.state;
    return (
      <Form>
        <TimedErrorMessage message={errorMessage} />

        {
          isLoading ? <Spinner type="grow"/> :

          subscriberDetails.status === 'unsubscribed' ?
            <>
              <p>Looks like you're not subscribed to our mailing list.</p>
              <Button onClick={() => this.subscribeUser()}>Subscribe</Button>
            </>
            :
            allTags.map((tag: string, index: number) => (
              <FormGroup check key={index}>
                <Label check>
                  <Input
                    type="checkbox"
                    defaultChecked={(subscriberDetails.tags && subscriberDetails.tags.length) ? subscriberDetails.tags.includes(tag) : false}
                    onChange={e => this.checkboxOnChange(e, tag)}
                  /> {tag}
                </Label>
              </FormGroup>
            ))
        }
      </Form>
    );
  }
}
