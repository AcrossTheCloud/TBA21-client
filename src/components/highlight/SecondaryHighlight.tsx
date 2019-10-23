import * as React from 'react';
import { Col, Row } from 'reactstrap';
import { FaCircle, FaPlay } from 'react-icons/fa';

import { FileTypes } from '../../types/s3File';
import { itemType } from '../../types/Item';
import { FileStaticPreview } from '../utils/DetailPreview';
import HighlightsItemDetails from './HighlightDetails';

export default function SecondaryHighlight(highlight, onOpenModal) {
  if (!highlight) return;
  return (
    <Col
      xs="12"
      lg="4"
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
      <Row className="d-none d-lg-block">
        <Col xs="12">
          <div className="detailPreview">
            {highlight.file ? (
              highlight.item_type === itemType.Audio ||
              highlight.file.type === FileTypes.Audio ? (
                <span>TODO remove this </span>
              ) : (
                // <HomePageAudioPreview
                //   data={highlight}
                //   openModal={() => onOpenModal(highlight)}
                // />
                <FileStaticPreview file={highlight.file} />
              )
            ) : (
              <></>
            )}
            {highlight.file.type === FileTypes.Video ? (
              <div className="middle">
                <FaPlay />
              </div>
            ) : (
              <></>
            )}
          </div>
          <HighlightsItemDetails index={1} onOpenModal={onOpenModal} />
        </Col>
      </Row>

      <Row className="d-lg-none py-4 py-lg-0">
        <Col xs="12">
          <div className="detailPreview">
            {highlight.file ? (
              highlight.item_type === itemType.Audio ||
              highlight.file.type === FileTypes.Audio ? (
                // <HomePageAudioPreview
                //   data={highlight}
                //   openModal={() => onOpenModal(highlight)}
                // />
                <span>TODO remove this </span>
              ) : (
                [
                  <FileStaticPreview file={highlight.file} />,
                  <HighlightsItemDetails index={1} />
                ]
              )
            ) : (
              <></>
            )}
            {highlight.file.type === FileTypes.Video ? (
              <div className="middle">
                <FaPlay />
              </div>
            ) : (
              <></>
            )}
          </div>
        </Col>
      </Row>
    </Col>
  );
}
