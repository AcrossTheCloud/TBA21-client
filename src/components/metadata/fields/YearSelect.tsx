import * as React from 'react';
import Select from 'react-select';
import { createOption, SelectObject } from '../../utils/react-select';
import { range } from 'lodash';

interface Props {
  callback?: Function;
  value: string | null;
  addOngoing: boolean;
}
interface State {
  value: SelectObject;
  inputValue: string;
}

export default class YearSelect extends React.Component<Props, State> {
  listOfYears;

  constructor(props: Props) {
    super(props);

    const { value, addOngoing } = this.props;

    const thisYear = (new Date()).getFullYear();
    this.listOfYears = range(thisYear + (addOngoing ? 5 : 1), 1800).map(y => ({ label: y.toString(), value: y.toString() }));
    if (addOngoing) {
      this.listOfYears.unshift({label: 'ongoing', value: 'ongoing'});
      this.listOfYears.unshift({label: '', value: ''});
    }

    this.state = {
      value: value ? { label: value, value: value } : {label: '', value: ''},
      inputValue: ''
    };
  }

  handleChange = (value: any, actionMeta) => { // tslint:disable-line: no-any
    let newValue = value;
    if (actionMeta.action === 'create-option') {
      newValue = createOption(newValue);
    }

    this.setState({ value: newValue });
    if (typeof this.props.callback === 'function') {
      this.props.callback(newValue ? newValue.label : '');
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>): void {
    if (prevProps.value !== this.props.value && this.props.value) {
      this.setState({value: { label: this.props.value, value: this.props.value }});
    }
  }

  handleInputChange = (inputValue: string) => {
    const numbersOnly = /^[0-9\b]+$/.test(inputValue);
    if (inputValue.length > 4 || !numbersOnly) {
      return;
    }
    this.setState({ inputValue });
  }

  handleCreateOption = (inputValue: string) => {
    this.setState({ inputValue: inputValue, value: createOption(inputValue) });
    if (typeof this.props.callback === 'function') {
      this.props.callback(inputValue);
    }
  }

  handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    let { inputValue } = this.state;
    if (!inputValue) { return; }

    const createdValue = createOption(inputValue);

    if (event.key === 'Enter' || event.key === 'Tab') {

      this.setState({
        inputValue: '',
        value: createdValue
      });
      event.preventDefault();

      if (typeof this.props.callback === 'function') {
        this.props.callback(createdValue.value);
      }
    }
  }

  render() {
    const { inputValue, value } = this.state;
    return (
      <Select
        className="select"
        classNamePrefix="select"
        menuPlacement="auto"
        onInputChange={this.handleInputChange}
        onChange={this.handleChange}
        onKeyDown={this.handleKeyDown}
        value={value}
        options={this.listOfYears}
        inputValue={inputValue}
        formatCreateLabel={i => i}
        onCreateOption={this.handleCreateOption}
      />
    );
  }
}
