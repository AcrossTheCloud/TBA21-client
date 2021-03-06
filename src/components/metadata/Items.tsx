import * as React from 'react';
import { has } from 'lodash';

import { FileUpload } from './FileUpload';
import { Item } from '../../types/Item';
import { ItemEditorWithCollapse } from './ItemEditor';
import { Button, Col, Row } from 'reactstrap';
import { RouteComponentProps, withRouter } from 'react-router';
import { AuthContext } from '../../providers/AuthProvider';
import { adminGetItem } from '../../REST/items';
import { removeTopology } from '../utils/removeTopology';

import 'styles/components/metadata/accordionCollapse.scss';

interface Props extends RouteComponentProps {
  callback?: Function;
  items?: Item[];
  allowRemoveItem?: boolean;
  isAdmin: boolean;
}

interface State {
  items: ItemsObject;
  isNewItem: boolean;
}

interface ItemsObject {
  [id: string]: {
    loaded: boolean,
    isLoading: boolean,
    details?: Item
  };
}

const ItemsDisplay = (props: { isNewItem: boolean, isAdmin: boolean, isContributorPath: boolean, removeItem: Function | undefined, s3Key: string, item: { loaded: boolean, isLoading: boolean, details?: Item }, callback: Function }): JSX.Element => {

  if (props.item && Object.keys(props.item).length && !props.item.isLoading && props.item.loaded && props.item.details) {
    return (
      <ItemEditorWithCollapse
        data={props.item.details}
        item={props.item.details}
        isContributorPath={props.isContributorPath}
        isOpen={props.isNewItem}
        isAdmin={props.isAdmin}
      >
        {props.removeItem && typeof props.removeItem === 'function' ?
          <Button color="danger" onClick={() => {if (props.removeItem) { props.removeItem(props.s3Key); }}}>Remove</Button>
          : <></>
        }
      </ItemEditorWithCollapse>
    );
  } else {
    if (props.item.isLoading) {
      return (
        <Row onClick={() => props.callback(props.s3Key)}>
          <Col xs="12">Loading....</Col>
        </Row>
      );
    } else {
      return (
        <Row onClick={() => props.callback(props.s3Key)}>
          <Col xs="12">Click here to load this item's details.</Col>
        </Row>
      );
    }
  }
};

class ItemsClass extends React.Component<Props, State> {
  _isMounted;
  isContributorPath;

  constructor(props: Props) {
    super(props);
    this._isMounted = false;

    this.state = {
      items: {},
      isNewItem: false
    };
  }

  componentDidMount(): void {
    this._isMounted = true;
    // If we have items from props, put them into the items state
    this.setState({ items: this.checkPropsItems() });
    const context: React.ContextType<typeof AuthContext> = this.context;
    if (!context.authorisation.hasOwnProperty('admin')) {
      this.isContributorPath = (this.props.location.pathname.match(/contributor/i));
    } else {
      this.isContributorPath = false;
    }
  }
  componentWillUnmount(): void {
    this._isMounted = false;
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>): void {
    if (!this._isMounted) { return; }

    if (prevProps.items !== this.props.items) {
      this.setState({ items: this.checkPropsItems() });
    }
  }

  checkPropsItems = (): ItemsObject => {
    let propItems: ItemsObject = {};
    if (this.props.items && this.props.items.length) {
      this.props.items.forEach( (item: Item) => {
        Object.assign(propItems, {
          [item.s3_key]: {
            loaded: true,
            isLoading: false,
            details: item
          }
        });
      });
    }
    return propItems;
  }

  /**
   *
   * A response s3key from the FileUpload component
   *
   * @param s3Key { string }
   */
  fileUploadCallback = async (s3Key: string): Promise<void> => {
    if (!this._isMounted) { return; }
    const items: ItemsObject = {};

    Object.assign(items, {
      [s3Key]: {
        loaded: false,
        isLoading: true
      }
    });

    // Load item
    this.loadItem(s3Key);

    this.setState({isNewItem: true, items: {...this.state.items, ...items} } );
  }

  /**
   * Get the item from the database by s3key, assign it to ItemObject
   * Set the loaded flag to true and isLoading to false and the details of the item from the db
   *
   * If we have a callback set as props, call it. (See CollectionsEditor)
   *
   * @param s3Key { string }
   */
  loadItem = async (s3Key: string): Promise<void> => {
    if (!this._isMounted) { return; }
    const
      items: ItemsObject = {},
      itemState = {
        loaded: false,
        isLoading: false,
      };
    try {
      const result: Item | null = await this.getItemByKey(s3Key);

      if (result) {
        Object.assign(itemState, { details: result, loaded: true });

        if (typeof this.props.callback === 'function') {
          this.props.callback(result.s3_key);
        }
      }
    } catch (e) {
      console.log('error', e);
    } finally {
      Object.assign(items, { [s3Key]: itemState });

      this.setState({ items: {...this.state.items, ...items} } );
    }
  }

  removeItem = (s3Key: string) => {
    if (!this._isMounted) { return; }
    const items: ItemsObject = this.state.items;
    if (items[s3Key]) {
      delete items[s3Key];
      this.setState({ items: items });
      if (typeof this.props.callback === 'function') {
        this.props.callback(s3Key, true);
      }
    }
  }

  getItemByKey = async (key: string): Promise<Item | null> => {
    if (!this._isMounted) { return null; }
    if (!key || ( has(this.state.items, key) && this.state.items[key].loaded )) { return null; }

    let
      counter = 6,
      timeoutSeconds = 1000;

    const doAPICall = async (s3Key: string): Promise<Item | null> => {
      return new Promise( resolve => {

        const apiTimeout = setTimeout( async () => {
          if (!this._isMounted) { clearTimeout(apiTimeout); return; }
          counter --;

          const response = await adminGetItem(this.isContributorPath, { s3Key });
          timeoutSeconds = timeoutSeconds * 2;

          const tryApiAgain = async() => {
            if (!counter) {
              clearTimeout(apiTimeout);
              return resolve(null);
            } else {
              return resolve(await doAPICall(s3Key));
            }
          };

          if (response) {
            const responseItems = removeTopology(response) as Item[];

            if (responseItems && responseItems.length && !!responseItems[0]) {
              const item = responseItems[0];
              clearTimeout(apiTimeout);
              return resolve(item);
            } else {
              tryApiAgain();
            }
          } else {
            tryApiAgain();
          }
        },                             timeoutSeconds);
      });
    };

    return await doAPICall(key);
  }

  render() {
    return (
      <>
        <FileUpload callback={this.fileUploadCallback} />
        {
          this.state.items && Object.keys(this.state.items).length ?
            <Row className="accordianHeadings">
              <Col className="itemIcons"  xs="1"/>
              <Col className="title"  xs="5">
                Title
              </Col>
              <Col className="creators"  xs="4">
                Creators
              </Col>
              <Col className="status"  xs="1">
                Status
              </Col>
              <Col className="removeButton"  xs="1"/>
            </Row>
            :
            <></>
        }
        {
          Object.entries(this.state.items).map( ( [s3Key, item] ) => {
            return <ItemsDisplay isNewItem={this.state.isNewItem} isAdmin={this.props.isAdmin} isContributorPath={this.isContributorPath} key={s3Key} s3Key={s3Key} item={item} callback={this.fileUploadCallback} removeItem={this.props.allowRemoveItem ? this.removeItem : undefined} />;
          })
        }

      </>
    );
  }
}

export const Items = withRouter(ItemsClass);
ItemsClass.contextType = AuthContext;
