import * as React from 'react';
import CreatableSelect from 'react-select/creatable';
import { SelectObject } from '../../utils/react-select';

interface Props {
  callback?: Function;
  values?: string[] | null;
  options?: SelectObject[];
}
interface State {
  values: SelectObject[];
  inputValue: string;
}

const createOption = (label: string): SelectObject => ({
  label,
  value: label,
});

export default class CustomSelect extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      values: (this.props.values && this.props.values.length) ? this.props.values.map(e => ({label: e, value: e})) : [],
      inputValue: ''
    };
  }

  handleChange = (values: any) => { // tslint:disable-line: no-any
    this.setState({values: values});
    if (typeof this.props.callback === 'function') {
      this.props.callback((values && values.length) ? values.map(e => e.value) : []);
    }
  }

  handleInputChange = (inputValue: string) => {
    this.setState({inputValue});
  }

  handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    let {inputValue, values} = this.state;
    if (!inputValue) {
      return;
    }

    if (!values) {
      values = [];
    }

    if (event.key === 'Enter' || event.key === 'Tab') {
      if (values && !values.find(v => v.label === inputValue)) {
        values.push(createOption(inputValue));
      }
      this.setState({
                      inputValue: '',
                      values: values
                    });
      event.preventDefault();

      if (typeof this.props.callback === 'function') {
        this.props.callback((values && values.length) ? values.map(e => e.value) : []);
      }
    }
  }

  render() {
    const {inputValue, values} = this.state;
    return (
      <CreatableSelect
        className="select"
        classNamePrefix="select"
        menuPlacement="auto"
        placeholder="Type an entry then press enter/tab..."
        components={{DropdownIndicator: null}}
        isClearable
        isMulti
        menuIsOpen={false}
        onInputChange={this.handleInputChange}
        onChange={this.handleChange}
        onKeyDown={this.handleKeyDown}
        value={values}
        options={this.props.options ? this.props.options : []}
        inputValue={inputValue}
      />
    );
  }
}
