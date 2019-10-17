import * as React from 'react';
import { Col, Row } from 'reactstrap';

export default function FocusVisualiser({
  focus_arts,
  focus_scitech,
  focus_action
}) {
  let focusTotal = 0;
  if (!!focus_action && !!focus_arts && !!focus_scitech) {
    focusTotal =
      parseInt(focus_action, 0) +
      parseInt(focus_arts, 0) +
      parseInt(focus_scitech, 0);
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
              focus_arts
            )}%, #9013FE ${focusPercentage(
              focus_scitech
            )}%, #50E3C2 ${focusPercentage(focus_action)}%)`
          }}
        />
      </Col>
    </Row>
  );
}
