import * as React from 'react';
import { createFilter } from 'react-select';
import AsyncSelect from 'react-select/async';
import { API } from 'aws-amplify';
import { find } from 'lodash';
import { Profile } from '../../../types/Profile';
import { SelectObject } from '../../utils/react-select';

interface State {
  profiles: SelectObject[];
  selectedProfiles: SelectObject[];
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
      await this.getProfiles();
    } else {
      this.setState({ isLoading: false });
    }
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  callback = () => {
    if ((this.props.callback && typeof this.props.callback === 'function')) {

      let selected: string[] = [];
      if (this.state.selectedProfiles && this.state.selectedProfiles.length) {
        selected = this.state.selectedProfiles.map(profile => profile.value);
      }

      this.props.callback(selected);
    }
  }

  getProfiles = async (): Promise<void> => {
    const
      selectOptions: SelectObject[] = [],
      { defaultValues } = this.props;

    if (defaultValues && defaultValues.length) {
      for (const uuid of defaultValues) {
        const results = await this.getProfile(uuid);
        if ((results && results[0]) && (results[0].cognito_uuid && results[0].full_name)) {
          selectOptions.push(
            {
              value: results[0].cognito_uuid,
              label: results[0].full_name
            }
          );
        }
      }

      if (this._isMounted) {
        this.setState({isLoading: false, profiles: selectOptions, selectedProfiles: selectOptions}, () => this.callback());
      }
    } else {
      if (this._isMounted) {
        this.setState({isLoading: false});
      }
    }
  }

  getProfile = async (uuid: string): Promise<Profile[] | false> => {
    try {
      const
        queryStringParameters = { uuid: uuid },
        results = await API.get('tba21', 'admin/profiles', { queryStringParameters: queryStringParameters });
      return results.profiles;
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
          queryStringParameters = ( inputValue ? { fullname: inputValue, notPublicUsers: true } : {} ),
          // Get all profiles, but no public users, we don't want to show your normal John Doe.
          results = await API.get('tba21', 'admin/profiles', { queryStringParameters: queryStringParameters }),

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
        resolve(profiles);
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
      this.setState({ selectedProfiles: [] }, () => this.callback());
    }

    if (actionMeta.action === 'select-option') {
      this.setState({isLoading: false, selectedProfiles: profilesList}, () => this.callback());
    }

    if (actionMeta.action === 'remove-value') {
      this.setState({selectedProfiles: profilesList}, () => this.callback());
    }
  }

  render() {
    const {
      className
    } = this.props;

    return (
      <div className={className ? className : ''}>
        <AsyncSelect
          isMulti
          isClearable
          isDisabled={this.state.isLoading}
          isLoading={this.state.isLoading}
          cacheOptions

          // options={this.state.profiles}
          defaultOptions={this.state.profiles}

          value={this.state.selectedProfiles}

          loadOptions={this.loadProfiles}
          onChange={this.onChange}

          filterOption={createFilter({ ignoreCase: true })}
        />
      </div>
    );
  }
}
