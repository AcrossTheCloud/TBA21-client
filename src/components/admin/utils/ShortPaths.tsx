import React from 'react';
import { Col, FormFeedback, FormGroup, PopoverBody, Row, UncontrolledPopover } from 'reactstrap';
import { FaRegQuestionCircle } from 'react-icons/fa';
import { API } from 'aws-amplify';
import CreatableSelect from 'react-select/creatable';
import { slugify } from '../../utils/slugify';
import { createOption, SelectObject } from '../../utils/react-select';

interface Props {
  type: 'Profile' | 'Collection' | 'Item';
  id?: string;
  onChange?: Function;
}
interface State {
  id?: string;
  invalid: boolean;
  value?: SelectObject;
  inputValue: string;
  loadedShortPaths: { label: string, value: string, isDisabled?: boolean }[];
  invalidFeedback: JSX.Element;
  isLoading?: boolean;
}

interface ShortPath {
  id: string;
  short_path: string;
  object_type: 'Item' | 'Profile' | 'Collection';
}

export default class ShortPaths extends React.Component<Props, State> {
  _isMounted;
  onChangeTimeout;

  constructor(props: Props) {
    super(props);
    this._isMounted = false;

    this.state = {
      id: !!this.props.id ? this.props.id : undefined,
      isLoading: true,
      invalid: !this.props.id,
      loadedShortPaths: [],
      inputValue: '',
      invalidFeedback: <></>
    };
  }

  async componentDidMount(): Promise<void> {
    this._isMounted = true;

    // If we've passed through an ID go get the already existing short paths!
    if (!!this.props.id) {
      const response: { short_paths: ShortPath[] } = await this.getShortPath('', this.props.id);
      if (response && response.short_paths && response.short_paths.length && response.short_paths[0]) {
        const loadedValues = response.short_paths.map(sp => createOption(sp.short_path));

        if (!this._isMounted) { return; }
        this.setState({ isLoading: false, value: createOption(response.short_paths[0].short_path), loadedShortPaths: loadedValues });

        if (typeof this.props.onChange === 'function') {
          this.props.onChange(response.short_paths[0].short_path);
        }

      } else {
        if (!this._isMounted) { return; }
        this.setState({ isLoading: false });
      }
    } else {
      if (!this._isMounted) { return; }
      this.setState({ isLoading: false });
    }
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>): void {
    if (this._isMounted) {
      if (!!this.props.id && prevProps.id !== this.props.id) {
        this.setState( { id: this.props.id, isLoading: false, invalid: false } );
      }
    }
  }

  /**
   * Loads the shortpaths by ID or Path string
   * @param path { string }
   * @param id { string }
   *
   * @returns { [] }
   */
  getShortPath = async (path: string, id?: string): Promise<{ short_paths: [] }> => {
    try {
      const query = {
        table: this.props.type
      };

      if (id) {
        Object.assign(query, { id: id });
      } else {
        Object.assign(query, { short_path: path });
      }

      return await API.get('tba21', 'shortpaths', { queryStringParameters : query });
    } catch (e) {
      return { short_paths: [] };
    }
  }

  /**
   * Takes the input value from React-Select and the actionMeta and does the require action.
   * @param value { any }
   * @param actionMeta { any }
   */
  onChange = async (value: any, actionMeta: any) => { // tslint:disable-line: no-any
    if (!this._isMounted) { return; }
    // Creation option, PUT the shortpath and insert it into loadedShortPaths
    if (actionMeta.action === 'create-option') {
      this.setState({ isLoading: true });

      const state = {
        isLoading: false,
        invalid: false,
        invalidFeedback: <></>
      };
      try {
        // Re-Slugify the value first, just incase a wild ending dash or space got through.
        await API.put('tba21', 'admin/shortpaths', {
          body: {
            short_path: slugify(value.label, true),
            id: this.state.id,
            object_type: this.props.type
          }
        });

        const shortpaths: SelectObject[] = [value, ...this.state.loadedShortPaths];

        Object.assign(state, {
          value: value,
          loadedShortPaths: shortpaths
        });

        if (typeof this.props.onChange === 'function') {
          this.props.onChange(value.label);
        }

      } catch (e) {
        // If the short path exists already, tell the user.
        if (e.response && e.response.data && !!e.response.data.conflict) {
          Object.assign(state, { invalid: true, invalidFeedback: <>The path <b>{value.label}</b> has already been taken</> });
        }
      } finally {
        if (!this._isMounted) { return; }
        this.setState(state);
      }
    }
  }

  /**
   * Updates inputValue state on change and slugifies the user input
   * Waits 400ms and trims the ending dashes or spaces.
   * @param value { string }
   */
  handleInputChange = (value: string) => {
    if (value && !value.length) { clearTimeout(this.onChangeTimeout); return; }
    if (this.onChangeTimeout) { clearTimeout(this.onChangeTimeout); }

    const slugifyValue = slugify(value, false);
    if (!this._isMounted) { return; }
    this.setState({ inputValue: slugifyValue, invalid: false }, () => {
      this.onChangeTimeout = setTimeout( () => {
        if (!this._isMounted) { return; }
        this.setState({ inputValue: slugify(slugifyValue, true) });
      }, 400);
    });
  }

  render() {
    return (
      <FormGroup>
        <Row className="align-items-center">
          <Col xs="12">
            <small>Short URL Path</small>
          </Col>
          <Col>
            <CreatableSelect
              className="select"
              classNamePrefix="select"
              placeholder="Short URL Path"
              menuPlacement="auto"
              isClearable

              isDisabled={this.state.isLoading}
              isLoading={this.state.isLoading}

              options={this.state.loadedShortPaths}
              value={this.state.value}
              inputValue={this.state.inputValue}
              formatCreateLabel={i => `Add new url ${i}`}
              onChange={this.onChange}
              onInputChange={this.handleInputChange}
            />
          </Col>
          <Col xs="1" className="px-0 iconWrapper">
            <FaRegQuestionCircle id={`urlslug-${this.state.id}-${this.props.type}`} />
            <UncontrolledPopover trigger="hover" placement="bottom" target={`urlslug-${this.state.id}-${this.props.type}`}>
              <PopoverBody>
                <div className="py-1">A url slug, or a short path, is a path that is user and web friendly.</div>
                <div className="py-1">This handy tool will show you all the paths for this piece of content and allow you to add another. As long as it doesn't exist already.</div>
                <div className="py-1">There is no overall primary short path, however the latest one (first one shown in the field) may be used on the interface.</div>
                <div className="py-1">You may use any of these paths when sharing this particular piece of content.</div>
                <div className="py-2">Choose wisely as you can't remove them.</div>
              </PopoverBody>
            </UncontrolledPopover>
          </Col>
        </Row>
        <Row>
          <Col>
            <FormFeedback style={this.state.invalid ? { display: 'block' } : { display: 'none' }}>
              {this.state.invalidFeedback}
            </FormFeedback>
          </Col>
        </Row>
      </FormGroup>
    );
  }
}
