import * as React from 'react';
import CreatableSelect from 'react-select/creatable';
import { SelectObject } from '../../utils/react-select';
import { range } from 'lodash';

interface Props {
  callback?: Function;
  value: string | null;
}
interface State {
  values: SelectObject[];
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
    this.listOfYears = range(1900, thisYear + 1).map(y => ({ label: y, value: y }));

    this.state = {
      values: value ? [{ label: value, value: value }] : [],
      inputValue: ''
    };
  }

  handleChange = (values: any) => { // tslint:disable-line: no-any
    this.setState({ values: values });
    if (typeof this.props.callback === 'function') {
      this.props.callback((values && values.length) ? values[0].value : []);
    }
  }

  handleInputChange = (inputValue: string) => {
    const numbersOnly = /^[0-9\b]+$/.test(inputValue);
    if (inputValue.length > 4 || !numbersOnly) {
      return;
    }
    this.setState({ inputValue });
  }

  handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    let { inputValue, values } = this.state;
    if (!inputValue) { return; }

    if (event.key === 'Enter' || event.key === 'Tab') {

      this.setState({
        inputValue: '',
        values: [createOption(inputValue)]
      });
      event.preventDefault();

      if (typeof this.props.callback === 'function') {
        this.props.callback((values && values.length) ? values[0].value : []);
      }
    }
  }

  render() {
    const { inputValue, values } = this.state;
    return (
      <CreatableSelect
        isClearable
        onInputChange={this.handleInputChange}
        onChange={this.handleChange}
        onKeyDown={this.handleKeyDown}
        value={values}
        options={this.listOfYears}
        inputValue={inputValue}
        formatCreateLabel={i => i}
        onCreateOption={i => this.setState({ inputValue: '', values: [createOption(i)]})}
      />
    );
  }
}
