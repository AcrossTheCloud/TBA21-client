import * as React from 'react';
import { Col, Row } from 'reactstrap';
import Share from '../utils/Share';
import moment from 'moment';
import { APITag } from '../metadata/Tags';
import { Regions, detailType } from '../../types/Item';
import { Collection } from '../../types/Collection';
import FocusVisualizer from '../visualizer/FocusVisualizer';
import renderForBrowser from '../utils/render-based-on-browser';

interface Props {
  collection: Collection;
}

class CollectionDetails extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);
    this.renderRow = this.renderRow.bind(this);
  }

  renderRow(
    label: string,
    value?: string | string[] | null,
    type?: detailType
  ) {
    if (!value) return;
    if (value instanceof Array && value.length > 0) {
      if (type === detailType.Region) {
        value = value.map(ea => Regions[ea]);
      }
      value = value.join(', ');
    }

    if (type === detailType.Time) {
      value = moment(value).format('Do MMMM YYYY');
    }

    return (
      <Row className="border-bottom subline details" key={label}>
        <Col xs="12" md="6">
          {label}
        </Col>
        <Col xs="12" md="6">
          {value}
        </Col>
      </Row>
    );
  }

  renderTags(label: string, tags?: APITag[] | null) {
    if (!tags) return;
    const hashTags = tags.length > 0 ? tags.map(t => `#${t.tag_name} `) : null;
    return (
      <Row className="border-bottom subline details" key={label}>
        <Col xs="12">{label}</Col>
        <Col xs="12">{hashTags}</Col>
      </Row>
    );
  }
  render() {
    const {
      id,
      creators,
      title,
      description,
      license,
      aggregated_concept_tags,
      aggregated_keyword_tags,

      focus_action,
      focus_arts,
      focus_scitech,
      time_produced,
      year_produced,
      venues,
      exhibited_at,
      url,
      regions,
      copyright_holder
    } = this.props.collection;

    const detailInfo = [
      { label: 'Publication Venue(s)', value: venues },
      { label: 'Exhibited At', value: exhibited_at },
      { label: 'Region', value: regions, type: detailType.Region },
      { label: 'License', value: license },
      { label: 'Copyright Owner', value: copyright_holder },
      { label: 'Link', value: url }
    ];

    const detailTags = [
      { label: 'Concept Tags', value: aggregated_concept_tags },
      { label: 'Keyword Tags', value: aggregated_keyword_tags }
    ];

    return (
      <Row>
        <Col xs="12" md="8" className="border-right">
          <Row>
            <Col
              xs={{ size: 12, order: 2 }}
              md={{ size: 8, order: 1 }}
              className="creators"
            >
              {creators ? creators.join(', ') : <></>}
            </Col>
          </Row>
          <Row>
            <Col>
              <h1>{title}</h1>
              <div className="description">{renderForBrowser(description)}</div>
            </Col>
          </Row>
          {!!id ? (
            <Row>
              <Col className="text-right">
                <Share suffix={`collection/${id}`} />
              </Col>
            </Row>
          ) : (
            ''
          )}
        </Col>

        <Col xs="12" md="4">
          {!!time_produced
            ? this.renderRow('Date Produced', time_produced, detailType.Time)
            : this.renderRow('Year Produced', year_produced, detailType.Time)}
          {detailInfo.map(row =>
            this.renderRow(row.label, row.value, row.type)
          )}
          {detailTags.map(tags => this.renderTags(tags.label, tags.value))}
          <FocusVisualizer
            action={focus_action}
            arts={focus_arts}
            scitech={focus_scitech}
          />
        </Col>
      </Row>
    );
  }
}

export default CollectionDetails;
