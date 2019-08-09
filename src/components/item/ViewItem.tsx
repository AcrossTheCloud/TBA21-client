import * as React from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';

import { fetchItem } from 'actions/items/viewItem';
import { State } from 'reducers/items/viewItem';
import { Alerts, ErrorMessage } from '../utils/alerts';

import { Item } from '../../types/Item';
import { MultiMedia } from '../utils/MultiMedia';

import 'styles/components/pages/item.scss';
import { Countries } from '../../types/Countries';
import { Ocean } from '../../types/Ocean';
import { Languages } from '../../types/Languages';

interface Props extends Alerts {
  fetchItem: Function;
  item: Item;
}

class ViewItem extends React.Component<Props, State> {
  matchedItemId: string = '';

  constructor(props: any) { // tslint:disable-line: no-any
    super(props);

    // Get our itemId passed through from URL props
    if (props.location && props.location.pathname) {
      this.matchedItemId = props.location.pathname.replace('/view/', '');
    }
  }

  componentDidMount() {
    // If we have an id from the URL pass it through, otherwise use the one from Redux State
    if (this.matchedItemId) {
      this.props.fetchItem(this.matchedItemId);
    } else {
      this.setState({ errorMessage: 'No item with that id.' });
    }
  }

  render() {
    if (typeof this.props.item === 'undefined') {
      return 'Loading...';
    }

    const {
      title,
      description,
      item_subtype,
      country_or_ocean,
      language,
      license,
      aggregated_concept_tags,
      aggregated_keyword_tags,

      focus_action,
      focus_arts,
      focus_scitech
    } = this.props.item;

    console.log('11language', !!language);
    console.log('language', typeof language, language);

    const focusPercentage = (level: string | number | null): number => {
      if (level === null) {
        return 0;
      }

      let theLevel = level;
      if (typeof level === 'string') {
        theLevel = parseInt(level, 0);
      }

      let percentage = 0;
      switch (theLevel) {
        case 3:
          percentage = 100;
          break;
        case 2:
          percentage = 66.66;
          break;
        case 1:
          percentage = 33.33;
          break;
        default:
          percentage = 0;
          break;
      }

      return percentage;
    };

    const ItemDetails = (props: { label: string, value: string }): JSX.Element => (
      <Row className="border-bottom subline details">
        <Col xs="12" md="6">{props.label}</Col>
        <Col xs="12" md="6">{props.value}</Col>
      </Row>
    );

    return (
      <div id="item" className="container-fluid">
        <ErrorMessage message={this.props.errorMessage} />
        <Row>
          <Col>
            {this.props.item.file ? <MultiMedia file={this.props.item.file} /> : 'No File to display.'}
          </Col>
        </Row>
        <Row>
          <Col md="8" className="left border-right border-bottom">
            <Row>
              <Col xs={{ size: 12, order: 2 }} md={{ size: 8, order: 1 }}>
                <h1>{title}</h1>
              </Col>
              <Col xs={{ size: 12, order: 1 }} md={{ size: 4, order: 2 }} className="subline text-right">
                {item_subtype}
              </Col>
            </Row>

            <Row>
              <Col>
                {description}
              </Col>
            </Row>
          </Col>
          <Col md="4" className="right">
            {!!country_or_ocean ? <ItemDetails label="Region" value={Countries[country_or_ocean] || Ocean[country_or_ocean]} /> : ''}
            {!!license ? <ItemDetails label="License" value={license} /> : ''}
            {!!language ? <ItemDetails label="Language" value={Languages[language]} /> : ''}

            {!!aggregated_concept_tags ?
              <Row className="border-bottom subline details">
                <Col xs="12">Concept Tags</Col>
                <Col xs="12">
                  {
                    aggregated_concept_tags.map(t => t.tag_name)
                  }
                </Col>
              </Row>
            : ''}
            {!!aggregated_keyword_tags ?
              <Row className="subline details">
                <Col xs="12">Keyword Tags</Col>
                <Col xs="12">
                  {
                    aggregated_keyword_tags.map(t => t.tag_name)
                  }
                </Col>
              </Row>
            : ''}
            <Row>
              <Col className="px-0">
                <div style={{ height: '15px', background: `linear-gradient(to right, #0076FF ${focusPercentage(focus_arts)}%, #9013FE ${focusPercentage(focus_scitech)}%, #50E3C2 ${focusPercentage(focus_action)}%)` }} />
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    );
  }
}

// State to props
const mapStateToProps = (state: { viewItem: State }) => { // tslint:disable-line: no-any
  return {
    errorMessage: state.viewItem.errorMessage,
    item: state.viewItem.item
  };
};

// Connect our redux store State to Props, and pass through the fetchItem function.
export default connect(mapStateToProps, { fetchItem })(ViewItem);
