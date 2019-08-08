import * as React from 'react';
import { Link } from 'react-router-dom';
import { Container, CardColumns, Card, CardBody, CardTitle, CardImg, CardText, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { FaSync } from 'react-icons/fa';

import { Alerts } from '../utils/alerts';
import { Item } from '../../types/Item';
import { fetchItems, fetchMoreItems } from '../../actions/items/viewItems';
import { State } from '../../reducers/items/viewItems';
import { sdkGetObject } from '../utils/s3File';

import { S3File } from '../../types/s3File';
import { AudioPlayer } from '../utils/AudioPlayer';

import 'styles/components/ViewItems.scss';

interface Props extends Alerts {
  fetchItems: Function;
  fetchMoreItems: Function;
  items: {
    [id: number]: Item
  };
}

const FileType = (props: { id: string, file: S3File }): JSX.Element => {
  if (props.file.url) {
    if (props.file.type === 'image') {
      return <CardImg src={props.file.url}/>;
    }
    if (props.file.type === 'audio') {
      return <AudioPlayer url={props.file.url} id={props.id} />
    }
  }
  return <></>;
};

const MasonryItem = ( props: { item: Item } ): JSX.Element => {
  const [ item, setItem ] = React.useState(props.item);

  // Check of the hook is mounted.
  const mounted: React.MutableRefObject<boolean> = React.useRef(true);
  React.useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  React.useEffect(() => {
    const getFile = async (key: string) => {
      const result = await sdkGetObject(props.item.s3_key);
      if (result && result.url && result.type && mounted.current) {
        setItem({ ...props.item, file: result });
      }
    };

    getFile(props.item.s3_key);
  }, [ props.item ]);

  return (
    <Card>
      <Link
        // to={`/view/${props.items.s3_key.split('/').slice(2).join('/')}`} // remove /private/UUID
        to={`/view/${item.s3_key}`}
        className="item"
      >
        {item.file ? <FileType id={item.s3_key} file={item.file} /> : <></>}
        <CardBody>
          <CardTitle>{item.title}</CardTitle>
          <CardText>{item.description}</CardText>
        </CardBody>
      </Link>
    </Card>
  );
};

/**
 *
 * Show items from the Items API call in a slider type view
 *
 */
class ViewItems extends React.Component<Props, {}> { // tslint:disable-line: no-any
  _isMounted;

  constructor(props: Props) {
    super(props);

    this._isMounted = false;
  }

  componentDidMount(): void {
    this._isMounted = true;
    if (!Object.keys(this.props.items).length) {
      this.props.fetchItems();
    }
  }

  componentWillUnmount(): void {
    this._isMounted = false;
  }

  render() {
    const
      itemsLength = Object.keys(this.props.items).length,
      count = itemsLength && (this.props.items[0] && this.props.items[0].count) ? this.props.items[0].count : 0;

    return (
      <Container id="viewItems">
        <CardColumns>
          {
            Object.entries(this.props.items).map( ([key, item]) => <MasonryItem key={item.s3_key} item={item} /> )
          }
        </CardColumns>

        {
          itemsLength && Object.keys(this.props.items).length < count ?
            <Button
              block
              color="primary"
              size="lg"
              onClick={() => this.props.fetchMoreItems(itemsLength)}
            >
              Load More &nbsp; <FaSync />
            </Button> : <></>
        }
      </Container>
    );
  }
}

const mapStateToProps = (state: { viewItems: State }) => ({ // tslint:disable-line: no-any
  items: state.viewItems.items,
});

export default connect(mapStateToProps, { fetchItems, fetchMoreItems })(ViewItems);
