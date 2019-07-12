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

interface Props extends Alerts {
  fetchItems: Function;
  fetchMoreItems: Function;
  items: {
    [id: number]: Item
  };
}

const Masonry = ( props: { items: {[id: number]: Item} } ) => {
  const items: JSX.Element[] = [];

  Object.entries(props.items).forEach( ([s3key, item]) => {
    items.push(
      <Card key={s3key}>
        <Link
          // to={`/view/${s3key.split('/').slice(2).join('/')}`} // remove /private/UUID
          to={`/view/${s3key}`}
          className="item"
        >
          <CardImg src={`https://place-hold.it/${Math.floor(Math.random() * 500) + 300}x500`}/>
          <CardBody>
            <CardTitle>{item.title}</CardTitle>
            <CardText>{item.description}</CardText>
          </CardBody>
        </Link>
      </Card>
    );
  });

  return (
    <CardColumns>
      {items}
    </CardColumns>
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
        <Masonry items={this.props.items} />
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
