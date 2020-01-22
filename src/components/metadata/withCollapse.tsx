import * as React from 'react';
import { Item } from '../../types/Item';
import { Col, Collapse, Row } from 'reactstrap';
import { FaCheck, FaMinus, FaPlus, FaTimes } from 'react-icons/fa';
import { Collection } from '../../types/Collection';

export interface WithCollapseProps {
  isOpen?: boolean;
  onChange?: Function;
  data: Item | Collection;
}
export function withCollapse <P extends object>(WrappedComponent: React.ComponentType<P>) {
  interface WithCollapseState {
    open: boolean;
    hasLoaded: boolean;
    data: Item | Collection;
  }

  return class CollapsedDisplay extends React.Component<P & WithCollapseProps, WithCollapseState> {
    constructor(props: P & WithCollapseProps) {
      super(props);
      this.state = {
        open: !!props.isOpen,
        hasLoaded: !!props.isOpen,
        data: props.data
      };
    }
    toggleCollapse = () => {
      this.setState({ open: !this.state.open, hasLoaded: true });
    }

    onChangeCallback = onChangeResult => {
      this.setState({ data: onChangeResult.data });

      if (this.props.onChange && typeof this.props.onChange === 'function') {
        this.props.onChange(onChangeResult);
      }
    }

    render() {
      return (
        <>
          <Row className="accordianCollapse">
            <Col className="itemIcons" xs="1" onClick={this.toggleCollapse}>
              {this.state.open ? <FaMinus /> : <FaPlus />}
            </Col>
            <Col className="title" onClick={this.toggleCollapse} xs="4" sm="5" >
              {this.state.data.title ? this.state.data.title : 'Untitled'}
            </Col>
            <Col className="creators" onClick={this.toggleCollapse} xs="4">
              {this.state.data.creators ? this.state.data.creators.join(', ') : <></>}
            </Col>
            <Col className="status" onClick={this.toggleCollapse}  xs="1">
              {this.state.data.status ? <FaCheck color="green" size={25} /> : <FaTimes color="red" size={25} />}
            </Col>
            <Col className="removeButton" xs="1">
              {this.props.children ? this.props.children : <></>}
            </Col>
            <Collapse isOpen={this.state.open}>
              {this.state.hasLoaded ? <WrappedComponent {...this.props as P} onChange={this.onChangeCallback} /> : <></>}
            </Collapse>
          </Row>
        </>
      );
    }
  };
}
