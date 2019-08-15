import * as React from 'react';
import { Col, PopoverBody, Row, UncontrolledPopover } from 'reactstrap';
import { CSSProperties } from 'react';

interface Props {
  id: string;
  colour: string;
  defaultValue?: number | undefined;
  onChange: Function;
}
interface State {
  value: number | null;
}

export default class Focus extends React.Component<Props, State> {
  _isMounted;

  constructor(props: Props) {
    super(props);
    this._isMounted = false;

    const { defaultValue } = this.props;

    this.state = {
      value: !!defaultValue ? defaultValue : null
    };
  }

  componentDidMount(): void {
    this._isMounted = true;
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  changeValue = (value: number) => {
    if (!this._isMounted) { return; }
    this.setState({ value: value });

    if (typeof this.props.onChange === 'function') {
      this.props.onChange(value);
    }
  }

  render() {
    const
      selectedStyle: CSSProperties = {
        background : this.props.colour,
        height : '10px'
      },
      style: CSSProperties = {
        background : '#DDDDDD',
        height : '10px'
      },
      { value } = this.state;
    return (
      <Row>
        <Col>
          <div id={`${this.props.id}_focus0`} style={(value !== null && value >= 0) ? selectedStyle : style} onClick={() => this.changeValue(0)} />
          <UncontrolledPopover placement="top" trigger="hover" target={`${this.props.id}_focus0`}>
            <PopoverBody>No level</PopoverBody>
          </UncontrolledPopover>
        </Col>
        <Col>
          <div id={`${this.props.id}_focus1`} style={value && value >= 1 ? selectedStyle : style} onClick={() => this.changeValue(1)} />
          <UncontrolledPopover placement="top" trigger="hover" target={`${this.props.id}_focus1`}>
            <PopoverBody>Level 1</PopoverBody>
          </UncontrolledPopover>
        </Col>
        <Col>
          <div id={`${this.props.id}_focus2`} style={value && value >= 2 ? selectedStyle : style}  onClick={() => this.changeValue(2)} />
          <UncontrolledPopover placement="top" trigger="hover" target={`${this.props.id}_focus2`}>
            <PopoverBody>Level 2</PopoverBody>
          </UncontrolledPopover>
        </Col>
        <Col>
          <div id={`${this.props.id}_focus3`} style={value && value === 3 ? selectedStyle : style}  onClick={() => this.changeValue(3)} />
          <UncontrolledPopover placement="top" trigger="hover" target={`${this.props.id}_focus3`}>
            <PopoverBody>Level 3</PopoverBody>
          </UncontrolledPopover>
        </Col>
      </Row>
    );
  }
}
