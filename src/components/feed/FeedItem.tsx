import * as React from 'react';
import { Col } from 'reactstrap';
import { connect } from 'react-redux';

import { waitForLoad } from '../../actions/home';
import { openModal } from '../../reducers/utils/modal';
import { HomepageData } from '../../types/Home';
import { FileTypes } from '../../types/s3File';
import { itemType } from '../../types/Item';

import { DetailPreview } from '../utils/DetailPreview';
interface Props {
  item: HomepageData;
  loadedCount: number;
  onOpenModal: () => void;
  onLoad: () => void;
}

class FeedItem extends React.Component<Props> {
  componentDidMount() {
    const { item } = this.props;
    console.log(item);
  }
  render() {
    const { item, onOpenModal, onLoad } = this.props;

    const { file, item_type } = item;

    if (!file) {
      return <></>;
    }

    const colSize = (fileType: string): number => {
      switch (fileType) {
        case 'Audio':
          return 12;

        case 'Video':
          return 8;

        default:
          return 4;
      }
    };

    return (
      <Col lg={colSize(!!file ? file.type : '')} className="pt-4">
        {item_type === itemType.Audio || file.type === FileTypes.Audio ? (
          // <HomePageAudioPreview
          //   data={item}
          //   openModal={() => dispatch(openModal(item))}
          // />
          <span>TO be removed </span>
        ) : (
          <div onClick={onOpenModal}>
            <DetailPreview data={item} onLoad={onLoad} />
          </div>
        )}
      </Col>
    );
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onOpenModal: () => {
      dispatch(openModal(ownProps.item));
    },
    onLoad: () => {
      console.log('mapDispatchToProps ----- ');
      dispatch(waitForLoad(ownProps.loadedCount - 1));
    }
  };
};

export default connect(
  null,
  mapDispatchToProps
)(FeedItem);
