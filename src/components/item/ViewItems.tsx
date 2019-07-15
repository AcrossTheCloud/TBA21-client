import * as React from 'react';
import { Link } from 'react-router-dom';
import { Container, CardColumns, Card, CardBody, CardTitle, CardImg, CardText, Button } from 'reactstrap';
import { connect } from 'react-redux';
import { FaSync } from 'react-icons/fa';

import { Alerts } from '../utils/alerts';
import { Item } from '../../types/Item';
import { fetchItems, fetchMoreItems } from '../../actions/items/viewItems';
import { State } from '../../reducers/items/viewItems';

import 'styles/components/ViewItems.scss';
import { sdkGetObject } from '../utils/s3File';

interface Props extends Alerts {
  fetchItems: Function;
  fetchMoreItems: Function;
  items: {
    [id: number]: Item
  };
}

const MasonryItem = ( props: { item: Item } ): JSX.Element => {
  const [ item, setItem ] = React.useState(props.item);

  React.useEffect(() => {
    const getFile = async (key: string) => {
      const result = await sdkGetObject(props.item.s3_key);
      if (result && result.blobURL && result.type) {
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
        {item.file && item.file.blobURL && item.file.type === 'image' ? <CardImg src={item.file.blobURL}/> : <></>}
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

  componentDidMount(): void {
    if (!Object.keys(this.props.items).length) {
      this.props.fetchItems();
    }
  }

  render() {
    const itemsLength = Object.keys(this.props.items).length;
    return (
      <Container id="viewItems">
        <CardColumns>
          {
            Object.entries(this.props.items).map( ([key, item]) => <MasonryItem key={item.s3_key} item={item} /> )
          }
        </CardColumns>

        {
          itemsLength && Object.keys(this.props.items).length < Object.values(this.props.items)[0].count ?
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
