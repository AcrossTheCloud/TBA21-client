import * as React from 'react';
import { API } from 'aws-amplify';
import { has } from 'lodash';

import { FileUpload } from './FileUpload';
import { Item } from '../../types/Item';
import { ItemEditor } from './ItemEditor';
import { AudioPlayer } from 'components/utils/AudioPlayer';

interface Props {
  callback?: Function;
  items?: Item[];
}

interface State {
  items: ItemsObject;
}

interface ItemsObject {
  [id: string]: {
    loaded: boolean,
    isLoading: boolean,
    details?: Item
  };
}

const ItemsDisplay = (props: { s3Key: string, item: { loaded: boolean, isLoading: boolean, details?: Item }, callback: Function }): JSX.Element => {
  if (props.item && Object.keys(props.item).length && !props.item.isLoading && props.item.loaded && props.item.details) {
    return (
      <div>
        <ItemEditor item={props.item.details}/>
      </div>
    );
  } else {
    if (props.item.isLoading) {
      return (
        <div onClick={() => props.callback(props.s3Key)}>
          Loading....
        </div>
      );
    } else {
      return (
        <div onClick={() => props.callback(props.s3Key)}>
          Click here to load this item's details.
        </div>
      );
    }
  }
};

export class Items extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    let propItems: ItemsObject = {};
    // If we have items from props, put them into the items state
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

    this.state = {
      items: propItems
    };
  }

  /**
   *
   * A response s3key from the FileUpload component
   *
   * @param s3Key { string }
   */
  fileUploadCallback = async (s3Key: string): Promise<void> => {
    const items: ItemsObject = {};

    Object.assign(items, {
      [s3Key]: {
        loaded: false,
        isLoading: true
      }
    });
    this.setState({ items: {...this.state.items, ...items} } );

    // Load item
    this.loadItem(s3Key);
  }

  /**
   * Get the item from the database by s3key, assign it to ItemObject
   * Set the loaded flag to true and isLoading to false and the details of the item from the db
   *
   * If we have a callback set as props, call it. (See CollectionsEditor)
   *
   * @param s3Key { string }
   */
  loadItem = async (s3Key: string) => {
    const items: ItemsObject = {};
    try {
      const result: Item | null = await this.getItemByKey(s3Key);
      if (result) {
        Object.assign(items, {
          [result.s3_key]: {
            loaded: true,
            isLoading: false,
            details: result
          }
        });

        this.setState({ items: {...this.state.items, ...items} } );

        if (typeof this.props.callback === 'function') {
          this.props.callback(result.s3_key);
        }
      }
    } catch (e) {
      console.log('No', e);
    }
  }

  getItemByKey = async (key: string): Promise<Item | null> => {
    if (!key || ( has(this.state.items, key) && this.state.items[key].loaded )) { return null; }

    let
      counter = 6,
      timeoutSeconds = 1000;

    const doAPICall = async (s3key: string): Promise<Item | null> => {
      return new Promise( resolve => {

        const apiTimeout = setTimeout( async () => {
          counter --;

          const response = await API.get('tba21', 'admin/items/getByS3KeyNC', {
            queryStringParameters: {
              s3Key: s3key
            }
          });

          timeoutSeconds = timeoutSeconds * 2;

          if (response.item) {
            clearTimeout(apiTimeout);
            return resolve(response.item);
          } else {
            if (!counter) {
              clearTimeout(apiTimeout);
              return resolve(null);
            } else {
              return resolve(await doAPICall(s3key));
            }
          }
        }, timeoutSeconds);
      });
    };

    return await doAPICall(key);
  }

  render() {
    return (
      <>

        TEST
        {
          // todo-dan remove
        }
        <AudioPlayer file="https://archive.org/download/testmp3testfile/mpthreetest.mp3" />

        <FileUpload callback={this.fileUploadCallback} />

        <div className="container-fluid">
          {
            Object.entries(this.state.items).map( ( [s3Key, item] ) => {
              return <ItemsDisplay key={s3Key} s3Key={s3Key} item={item} callback={this.fileUploadCallback} />;
            })
          }
        </div>
      </>
    );
  }
}
