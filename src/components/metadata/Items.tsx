import * as React from 'react';
import { API } from 'aws-amplify';
import { has } from 'lodash';

import { FileUpload } from './FileUpload';
import { Item } from '../../types/Item';
import { ItemEditor } from './ItemEditor';

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

export class Items extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);

    this.state = {
      items: {}
    };
  }

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
    const ItemsDisplay = (props: { s3Key: string, item: { loaded: boolean, isLoading: boolean, details?: Item } }): JSX.Element => {
      if (props.item && Object.keys(props.item).length && !props.item.isLoading && props.item.loaded && props.item.details) {
        return (
          <div>
            <ItemEditor item={props.item.details}/>
          </div>
        );
      } else {
        if (props.item.isLoading) {
          return (
            <div onClick={() => this.fileUploadCallback(props.s3Key)}>
              Loading....
            </div>
          );
        } else {
          return (
            <div onClick={() => this.fileUploadCallback(props.s3Key)}>
              Click here to load this item's details.
            </div>
          );
        }
      }
    };

    return (
      <>
        <FileUpload callback={this.fileUploadCallback} />

        <div className="container-fluid">
          {
            Object.entries(this.state.items).map( ( [s3Key, item] ) => {
              return <ItemsDisplay key={s3Key} s3Key={s3Key} item={item} />;
            })
          }
        </div>
      </>
    );
  }
}
