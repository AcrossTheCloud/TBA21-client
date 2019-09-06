import * as React from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';

import { fetchItem } from 'actions/items/viewItem';
import { State } from 'reducers/items/viewItem';
import { Alerts, ErrorMessage } from '../utils/alerts';

import { Item, Regions } from '../../types/Item';
import { FilePreview } from '../utils/FilePreview';
import { Languages } from '../../types/Languages';

import 'styles/components/pages/viewItem.scss';
import { browser } from '../utils/browser';

interface Props extends Alerts {
  fetchItem: Function;
  item: Item;
}

class ViewItem extends React.Component<Props, State> {
  matchedItemId: string = '';
  browser: string;

  constructor(props: any) { // tslint:disable-line: no-any
    super(props);

    this.browser = browser();

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
      file,
      creators,
      title,
      description,
      item_subtype,
      regions,
      language,
      license,
      aggregated_concept_tags,
      aggregated_keyword_tags,

      focus_action,
      focus_arts,
      focus_scitech
    } = this.props.item;

    let focusTotal = 0;
    if (!!focus_action && !!focus_arts && !!focus_scitech) {
      focusTotal = parseInt(focus_action, 0) + parseInt(focus_arts, 0) + parseInt(focus_scitech, 0);
    }

    const focusPercentage = (level: number | string | undefined | null): string => {
      if (typeof level === 'undefined' || level === null) { return '0'; }
      if (typeof level === 'string') {
        level = parseInt(level, 0);
      }
      return `${ (level / focusTotal) * 100 }`;
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
        {file && file.url ?
          <Row className="file">
            <FilePreview file={file}/>
          </Row>
          : <></>
        }
        <Row>
          <Col md="8" className="left border-right">
            <Row>
              <Col xs={{ size: 12, order: 2 }} md={{ size: 8, order: 1 }} className="creators">
                {creators ? creators.join(', ') : <></>}
              </Col>
              <Col xs={{ size: 12, order: 1 }} md={{ size: 4, order: 2 }} className="subline text-right">
                {item_subtype}
              </Col>
            </Row>
            <Row>
              <Col>
                <h1>{title}</h1>
              </Col>
            </Row>

            <Row>
              <Col className="description">
                {
                  description ?
                    this.browser === 'ie6-11' ? description.split('\n').map((d, i) => <p key={i}>{d}</p>) : description
                  : <></>
                }
              </Col>
            </Row>
          </Col>
          <Col md="4" className="right">
            {!!regions ?
              regions.map( (region, i) => (
                <ItemDetails key={i} label="Region" value={Regions[region]} />
              ))
            :
              ''
            }
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
