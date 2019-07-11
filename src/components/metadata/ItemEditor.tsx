import * as React from 'react';
import { Button, Col, Form, FormGroup, Input, Label, Row } from 'reactstrap';

import { API, Storage } from 'aws-amplify';
import Select from 'react-select';

import { Item } from '../../types/Item';
import { itemTextSubTypes, licenseType, oceans } from './SelectOptions';
import Tags from './Tags';

interface Props {
  item: Item;
}

interface State {
  item: Item;
  loadingRekognitionTags: boolean;
  rekognitionTags?: string[];
}

export class ItemEditor extends React.Component<Props, State> {
  _isMounted;

  constructor(props: Props) {
    super(props);

    this._isMounted = false;

    this.state = {
      item:  props.item,
      loadingRekognitionTags: props.item.keyword_tags === null,
    };
  }

  async componentDidMount(): Promise<void> {
    this._isMounted = true;

    if (this.state.loadingRekognitionTags) {
      await this.getItemRekognitionTags();
    }
  }

  getItemRekognitionTags = async () => {
    let
      counter = 6,
      timeoutSeconds = 1000;

    const doAPICall = async (): Promise<string[] | []> => {
      return new Promise( resolve => {

        const apiTimeout = setTimeout( async () => {
          counter --;

          try {
            const response = await API.get('tba21', 'items/getRekognitionTags', {
              queryStringParameters: {
                s3key: this.state.item.s3_key
              }
            });

            timeoutSeconds = timeoutSeconds * 1.2;

            if (response.tags && response.tags.length) {
              clearTimeout(apiTimeout);
              return resolve(response.tags);
            } else {
              if (!counter) {
                clearTimeout(apiTimeout);
                return resolve([]);
              } else {
                return resolve(await doAPICall());
              }
            }
          } catch (e) {
            console.log('ERR - ', e);
            return resolve([]);
          }

        }, timeoutSeconds);
      });
    };

    try {
      const results = await doAPICall();
      this.setState({ loadingRekognitionTags: false, rekognitionTags: results });
    } catch (e) {
      this.setState({ loadingRekognitionTags: false });
      console.log('ERROR -- ', e);
    }
  }

  getItemFile = async () => {
    try {
      const
        key = this.state.item.s3_key.split('/').slice(2).join('/'),
        result = await Storage.get(key, {level: 'private', download: true});

      console.log(result);
    } catch (e) {
      console.log('getItemFile', e);
    }
  }

  updateItem = async () => {
    const itemsProperties = {};

    Object.entries(this.state.item)
      .filter( ([key, value]) => {
         return !(
           value === null ||
           key === 'count' || key === 'image_hash' ||
           key === 'sha512' || key === 'aggregated_keyword_tags' ||
           key === 'aggregated_concept_tags' || key === 'md5' ||
           key === 'created_at' || key === 'updated_at' || key === 'machine_recognition_tags'
         );
      })
      .forEach( tag => {
        Object.assign(itemsProperties, { [tag[0]]: tag[1]});
      });

    API.put('tba21', 'admin/items/update', {
      body: {
        ...itemsProperties
      }
    });
  }

  render() {
    const {
      title,
      description,
      time_produced,
      status,

      country_or_ocean,
      license,

      aggregated_keyword_tags

    } = this.state.item;

    const keywordTags = aggregated_keyword_tags ? aggregated_keyword_tags.map( t => ({ id: t.id, value: t.id, label: t.tag_name}) ) : [];

    return (
      <Form className="container-fluid">
        <Row>
          <Col md="6">
            <FormGroup>
              <Label for="title">Title</Label>
              <Input id="title" defaultValue={title ? title : ''} onChange={e => this.setState({ item: { ...this.state.item, title: e.target.value } })}/>
            </FormGroup>

            <FormGroup>
              <Label for="description">Description</Label>
              <Input type="textarea" id="description" defaultValue={description ? description : ''} onChange={e => this.setState({ item: { ...this.state.item, description: e.target.value } })}/>
            </FormGroup>

            <FormGroup>
              <Label for="status">Status</Label>
              <Input
                type="select"
                name="status"
                onChange={e => this.setState({ item: { ...this.state.item, status: e.target.value === 'true' } })}
                defaultValue={status ? 'true' : 'false'}
              >
                <option value="false">Unpublished</option>
                <option value="true">Publish</option>
              </Input>
            </FormGroup>
          </Col>

          <Col md="6">
            <FormGroup>
              <Label for="concept_tags">Concept Tags</Label>
              <Tags className="concept_tags" type="concept" />
            </FormGroup>

            <FormGroup>
              <Label for="keyword_tags">Keyword Tags</Label>
              {this.state.loadingRekognitionTags ?
                <div>Loading Tags</div> :
                <Tags
                  className="keyword_tags"
                  type="keyword"
                  defaultValues={keywordTags}
                  defaultOptionsStrings={this.state.rekognitionTags}
                  callback={tagIds => this.setState({ item: { ...this.state.item, keyword_tags: tagIds ? tagIds : [] } })}
                />
              }
            </FormGroup>
          </Col>

          <Col xs="12">
            <FormGroup>
              <Label for="time_produced">Time Produced</Label>
              <Input type="date" id="time_produced" defaultValue={time_produced ? time_produced : new Date().toISOString().substr(0, 10)} />
            </FormGroup>

            <FormGroup>
              <Label for="location">Location</Label>
              <Select id="location" options={oceans} value={country_or_ocean ? {value: country_or_ocean, label: country_or_ocean} : []} onChange={e => this.setState({ item: { ...this.state.item, country_or_ocean: e.label  } })} isSearchable/>
            </FormGroup>

            <FormGroup>
              <legend>Focus</legend>
              <Label for="art">Art</Label>
              <Input className="art" type="range" step="1" min="0" max="3"/>
              <Label for="scitech">Sci Tech</Label>
              <Input className="scitech" type="range" step="1" min="0" max="3"/>
              <Label for="action">Action</Label>
              <Input className="action" type="range" step="1" min="0" max="3"/>
            </FormGroup>

            <FormGroup>
              <Label for="sub_type">Sub Type</Label>
              <Select id="sub_type" options={itemTextSubTypes} isSearchable/>
            </FormGroup>

            <FormGroup>
              <Label for="license_type">License</Label>
              <Select id="license_type" options={licenseType} value={license ? {value: license, label: license} : []} onChange={e => this.setState({ item: { ...this.state.item, license: e.label  } })} isSearchable/>
            </FormGroup>

            <Button onClick={this.updateItem}>Update</Button>
          </Col>
        </Row>
      </Form>
    );
  }
}
