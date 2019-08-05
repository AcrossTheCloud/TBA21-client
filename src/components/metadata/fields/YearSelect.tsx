import * as React from 'react';
import CreatableSelect from 'react-select/creatable';
import { SelectObject } from '../../utils/react-select';
import { range } from 'lodash';

interface Props {
  callback?: Function;
  value: string | null;
}
interface State {
  value: SelectObject;
  inputValue: string;
}

const createOption = (label: string): SelectObject => ({
  label,
  value: label,
});

export default class YearSelect extends React.Component<Props, State> {
  listOfYears;

  constructor(props: Props) {
    super(props);

    const { value } = this.props;

    const thisYear = (new Date()).getFullYear();
    this.listOfYears = range(1900, thisYear + 1).map(y => ({ label: y.toString(), value: y.toString() }));

    this.state = {
      value: value ? { label: value, value: value } : {label: '', value: ''},
      inputValue: ''
    };
  }

  handleChange = (value: any) => { // tslint:disable-line: no-any
    this.setState({ value: value });
    if (typeof this.props.callback === 'function') {
      this.props.callback(value ? value.value : '');
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
    this.setState({ inputValue: '', value: createOption(inputValue) });
    if (typeof this.props.callback === 'function') {
      this.props.callback(inputValue);
    }
  }

  handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    let { inputValue, value } = this.state;
    if (!inputValue) { return; }

    if (event.key === 'Enter' || event.key === 'Tab') {

      this.setState({
        inputValue: '',
        value: createOption(inputValue)
      });
      event.preventDefault();

      if (typeof this.props.callback === 'function') {
        this.props.callback(value.value);
      }
    }
  }

  render() {
    const { inputValue, value } = this.state;
    return (
      <CreatableSelect
        isClearable
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
