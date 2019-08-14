import * as React from 'react';
import Async from 'react-select/async';
import { API } from 'aws-amplify';
import { find } from 'lodash';
import { Profile } from '../../../types/Profile';
import { SelectObject } from '../../utils/react-select';

interface State {
  profiles: SelectObject[];
  selectedProfiles: SelectObject[];
  defaultValues?: SelectObject[];
  isLoading: boolean;
}

interface Props {
  className?: string;
  defaultValues?: string[];
  callback?: Function;
}

export default class Contributors extends React.Component<Props, State> {
  _isMounted;
  loadTimeout;

  constructor(props: Props) {
    super(props);

    this._isMounted = false;

    this.state = {
      profiles: [],
      selectedProfiles: [],
      isLoading: !!this.props.defaultValues
    };
  }

  async componentDidMount(): Promise<void> {
    this._isMounted = true;
    if (this.props.defaultValues && this.props.defaultValues.length) {
      this.getProfiles();
    }
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps: Props, prevState: State): void {
    if (prevProps.defaultValues !== this.props.defaultValues) {
      this.getProfiles();
    }
  }

  getProfiles = async (): Promise<void> => {
    const
      selectOptions: SelectObject[] = [],
      { defaultValues } = this.props;

    if (defaultValues && defaultValues.length) {
      for (const uuid of defaultValues) {
        const profile = await this.getProfile(uuid);
        if (profile && profile.cognito_uuid && profile.full_name) {
          selectOptions.push({ value: profile.cognito_uuid, label: profile.full_name });
        }
      }

      this.setState({ isLoading: false, defaultValues: selectOptions });
    }
  }

  getProfile = async (uuid: string): Promise<Profile | false> => {
    try {
      const queryStringParameters = { uuid: uuid };
      return await API.get('tba21', 'profiles', { queryStringParameters: queryStringParameters });
    } catch (e) {
      return false;
    }
  }

  /**
   *
   * Load profiles that match the given string
   *
   * Timeout for the user keyboard presses, clear the timeout if they've pressed another key within 500ms and start again,
   * This avoids multiple calls before the user has finished typing.
   *
   * @param inputValue { string }
   */
  loadProfiles = async (inputValue: string) => {
    if (inputValue && inputValue.length <= 1) { clearTimeout(this.loadTimeout); return; }

    if (this.loadTimeout) { clearTimeout(this.loadTimeout); }

    return new Promise( resolve => {
      this.loadTimeout = setTimeout(async () => {
        clearTimeout(this.loadTimeout);

        const
          queryStringParameters = ( inputValue ? { query: inputValue } : {} ),
          results = await API.get('tba21', 'profiles', { queryStringParameters: queryStringParameters }),

          profiles = results.profiles.map((t: Profile) => ({value: t.cognito_uuid, label: t.full_name})),
          filteredProfiles = profiles.filter(profile => !find(this.state.profiles, { value: profile.value }));

        if (!this._isMounted) { clearTimeout(this.loadTimeout); return; }
        this.setState(
          {
            isLoading: false,
            profiles: [...this.state.profiles, ...filteredProfiles]
          }
        );

        // Return the profiles to React Select
        resolve(filteredProfiles.filter(tag => tag.label.includes(inputValue)));
      }, 500);
    });
  }

  /**
   * OnChange event for React-Select
   *
   * Detects each ActionMeta (event) from React Select and does the correct action.
   *
   * @param profilesList { any }
   * @param actionMeta { any }
   */
  onChange = async (profilesList: any, actionMeta: any) => { // tslint:disable-line: no-any
    if (!this._isMounted) { return; }

    if (actionMeta.action === 'clear') {
      this.setState({ selectedProfiles: [] });
    }

    if (actionMeta.action === 'select-option') {
      this.setState({isLoading: false, selectedProfiles: profilesList});
    }

    if (actionMeta.action === 'remove-value') {
      this.setState({selectedProfiles: profilesList});
    }

    if ((this.props.callback && typeof this.props.callback === 'function') && (this.state.selectedProfiles && this.state.selectedProfiles.length > 0)) {
      this.props.callback(this.state.selectedProfiles.map(profile => profile.value));
    }
  }

  render() {
    const {
      className
    } = this.props;

    return (
      <div className={className ? className : ''}>
        <Async
          isMulti
          isDisabled={this.state.isLoading}
          isLoading={this.state.isLoading}
          cacheOptions
          options={this.state.profiles}
          defaultValue={this.state.defaultValues}
          loadOptions={this.loadProfiles}
          onChange={this.onChange}
        />
      </div>
    );
  }
}
