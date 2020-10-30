import * as React from 'react';
import { connect } from 'react-redux';
import { Row, Col } from 'reactstrap';
import { fetchItem } from 'actions/items/viewItem';
import { ViewItemState } from 'reducers/items/viewItem';
import { Alerts, ErrorMessage } from '../utils/alerts';
import { Item, itemType } from '../../types/Item';
import { FilePreview } from '../utils/FilePreview';
import { browser } from '../utils/browser';
import { RouteComponentProps, withRouter } from 'react-router';
import 'styles/components/pages/embedItem.scss'; 
import logo from 'images/logo/oa_web_white.svg';
import { FileTypes } from '../../types/s3File';
import AudioPreview from '../layout/audio/AudioPreview';
import { dateFromTimeYearProduced } from '../../actions/home';
import { HomepageData } from '../../reducers/home';
import { FaShareSquare } from 'react-icons/fa';

type MatchParams = {
  id: string;
};

interface Props extends RouteComponentProps<MatchParams>, Alerts {
  fetchItem: Function;
  item: Item;
}

interface State {
  errorMessage: string | undefined;
  item: HomepageData | Item | undefined;
}

class EmbedItem extends React.Component<Props, State> {
  browser: string;

  constructor(props: any) { // tslint:disable-line: no-any
    super(props);

    this.browser = browser();

    this.state = {
      errorMessage: undefined,
      item: undefined
    };
  }

  componentDidMount() {

    const { match } = this.props;
    let matchedItemId: string | null = null;

    // Get our itemId passed through from URL props
    if (match.params.id) {
      matchedItemId = match.params.id;
    }

    // If we have an id from the URL pass it through, otherwise use the one from Redux State
    if (matchedItemId) {
      this.props.fetchItem(matchedItemId);
    } else {
      this.setState({ errorMessage: 'No item with that id.' });
    }
  }

  render() {
    if (typeof this.props.item === 'undefined') {
      return <ErrorMessage message={this.props.errorMessage} />;
    }

    const {
      id,
      file,
      creators,
      title,
      time_produced, year_produced, end_year_produced,
      item_type
    } = this.props.item;

    const isAudio = (!!file && item_type === itemType.Audio) || (!!file && file.type === FileTypes.Audio);

    return (
      <div id="embed_item" className="container-fluid h-100 w-80">
        <ErrorMessage message={this.props.errorMessage} />
        <Row>
          <Col md="12">
            <img src={logo} id="embed_logo" alt="Ocean Archive logo"></img>
            <span id="embed_title">{creators ? creators.join(', ') : <></>} – {title}
            </span>
            <a id="open_link" href={'https://ocean-archive.org/view/'+id} target="_blank" rel="noreferrer noopener"><FaShareSquare size={22}/></a>
          </Col>
        </Row>
            
        {file && file.url ?
          (
            <Row className="file h-100">
              {
                isAudio ?
                    (
                      <div className="w-100">
                        <AudioPreview
                          data={{
                            id: `${id}_slider`,
                            title: title ? title : '',
                            url: file.url,
                            isCollection: false,
                            date: dateFromTimeYearProduced(time_produced, year_produced, end_year_produced)
                          }}
                        />
                      </div>
                    )
                  : <FilePreview file={file}/>
              }

            </Row>
          )
          : <></>
        }
        
      </div>
    );
  }
}

// State to props
const mapStateToProps = (state: { viewItem: ViewItemState }) => ({
  errorMessage: state.viewItem.errorMessage,
  item: state.viewItem.item
});

// Connect our redux store State to Props, and pass through the fetchItem function.
export default withRouter(connect(mapStateToProps, {
  fetchItem,
})(EmbedItem));
