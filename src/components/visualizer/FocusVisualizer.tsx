import * as React from 'react';
import { Col, Row } from 'reactstrap';

export default function FocusVisualizer({ arts, scitech, action }) {
  let focusTotal = 0;
  if (!!action && !!arts && !!scitech) {
    focusTotal = parseInt(action, 0) + parseInt(arts, 0) + parseInt(scitech, 0);
  }

  const focusPercentage = (
    level: number | string | undefined | null
  ): string => {
    if (typeof level === 'undefined' || level === null) {
      return '0';
    }
    if (typeof level === 'string') {
      level = parseInt(level, 0);
    }
    return `${(level / focusTotal) * 100}`;
  };

  return (
    <Row>
      <Col className="px-0">
        <div
          style={{
            height: '15px',
            background: `linear-gradient(to right, #0076FF ${focusPercentage(
              arts
            )}%, #9013FE ${focusPercentage(
              scitech
            )}%, #50E3C2 ${focusPercentage(action)}%)`
          }}
        />
      </Col>
    </Row>
  );
}
