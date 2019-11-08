import * as React from 'react';
import { Col, Row } from 'reactstrap';

import { HomepageData } from '../../types/Home';
import { FileTypes } from '../../types/s3File';
import { itemType } from '../../types/Item';
import HighlightPreview from './HighlightPreview';

interface Props {
  highlight: HomepageData;
  index: number;
  hasMultiple: boolean;
  onOpenModal: Function;
}

class HighlightItem extends React.Component<Props, {}> {
  shouldComponentUpdate(nextProps: Props) {
    if (this.props.highlight) {
      return nextProps.highlight.id !== this.props.highlight.id;
    } else {
      return true;
    }
  }
  render() {
    const { highlight, index, hasMultiple, onOpenModal } = this.props;
    const isPrimary = index === 0;
    const primarySize = hasMultiple ? 8 : 12;
    const size = isPrimary ? primarySize : 4;
    const preview = (
      <HighlightPreview
        highlight={highlight}
        openModal={onOpenModal}
        index={index}
      />
    );
    return (
      <Col
        xs="12"
        lg={size}
        className="item"
        onClick={() => {
          if (
            highlight.item_type !== itemType.Audio ||
            (highlight.file && highlight.file.type) !== FileTypes.Audio
          ) {
            onOpenModal(highlight);
          }
        }}
      >
        {isPrimary
          ? <>{preview}</>
          :
          <>
            <Row className="d-none d-lg-block" key="lg">
              <Col xs="12">{preview}</Col>
            </Row>
            <Row className="d-lg-none py-4 py-lg-0" key="lg-none">
              <Col xs="12">{preview}</Col>
            </Row>
          </>
        }
      </Col>
    );
  }
}

export default HighlightItem;
