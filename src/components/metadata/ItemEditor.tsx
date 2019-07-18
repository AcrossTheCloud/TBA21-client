import * as React from 'react';
import { Button, Col, Form, FormGroup, Input, Label, Row } from 'reactstrap';

import { API } from 'aws-amplify';
import Select from 'react-select';

import { Item } from '../../types/Item';
import { itemTextSubTypes, licenseType, oceans } from './SelectOptions';
import Tags from './Tags';
import { storageGet } from '../utils/s3File';
import { Alerts, ErrorMessage, SuccessMessage } from '../utils/alerts';


import 'styles/components/metadata/itemEditor.scss';

interface Props {
  item: Item;
}

interface State extends Alerts{
  item: Item;
  filePreview?: JSX.Element;
  isLoading: boolean;
}

export class ItemEditor extends React.Component<Props, State> {
  _isMounted;

  constructor(props: Props) {
    super(props);

    this._isMounted = false;

    this.state = {
      item: props.item,
      isLoading: true
    };
  }

  async componentDidMount(): Promise<void> {
    this._isMounted = true;

    await this.getItemFile();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  getItemFile = async (): Promise<void> => {
    let element;

    try {
      const
        key = this.state.item.s3_key.split('/').slice(2).join('/'),
        result = await storageGet(key);

      if (result && result.blobURL) {
        if (result.type === 'image') {
          element = <img className="img-fluid" src={result.blobURL} alt={this.state.item.title ? this.state.item.title : this.state.item.s3_key}/>;
        }
      }

    } catch (e) {
      console.log('getItemFile', e);
    } finally {
      const state = {
        isLoading: false
      };
      if (element) {
        Object.assign(state, { filePreview: element });
      }

      this.setState(state);
    }
  }

  updateItem = async () => {
    this.setState({ isLoading: true });

    try {
      const
        itemsProperties = {},
        state = {
          isLoading: false
        };

      Object.entries(this.state.item)
        .filter( ([key, value]) => {
          return !(
            value === null ||
            key === 'count' || key === 'image_hash' || key === 'exif' ||
            key === 'sha512' || key === 'aggregated_keyword_tags' ||
            key === 'aggregated_concept_tags' || key === 'md5' ||
            key === 'created_at' || key === 'updated_at' || key === 'machine_recognition_tags'
          );
        })
        .forEach( tag => {
          Object.assign(itemsProperties, { [tag[0]]: tag[1]});
        });

      const result = await API.put('tba21', 'admin/items/update', {
        body: {
          ...itemsProperties
        }
      });

      if (!result.success && result.message && result.message.length > 1) {
        Object.assign(state, { errorMessage: result.message, item: { ...this.state.item, status: false } });
      } else {
        Object.assign(state, { successMessage: 'Updated item!' });
      }

      this.setState(state);

    } catch (e) {
      console.log(e);
      this.setState({ isLoading: false, errorMessage: 'We had an issue updating this item.' });
    }
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
      <Form className="container-fluid itemEditor">
        <div className={`overlay ${this.state.isLoading ? 'show' : ''}`} />
        <Row>
          <ErrorMessage message={this.state.errorMessage} />
          <SuccessMessage message={this.state.successMessage} />
          { this.state.filePreview ?
            <Col md="6">
              {this.state.filePreview}
            </Col>
            : <></>
          }
          <Col md="6">
            <FormGroup>
              <Label for="title">Title</Label>
              <Input id="title" defaultValue={title ? title : ''} onChange={e => this._isMounted ? this.setState({ item: { ...this.state.item, title: e.target.value } }) : false}/>
            </FormGroup>

            <FormGroup>
              <Label for="description">Description</Label>
              <Input type="textarea" id="description" defaultValue={description ? description : ''} onChange={e => this._isMounted ? this.setState({ item: { ...this.state.item, description: e.target.value } }) : false}/>
            </FormGroup>

            <FormGroup>
              <Label for="status">Status</Label>
              <Input
                type="select"
                name="status"
                onChange={e => this._isMounted ? this.setState({ item: { ...this.state.item, status: e.target.value === 'true' } }) : false}
                value={status ? 'true' : 'false'}
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
                <Tags
                  className="keyword_tags"
                  type="keyword"
                  defaultValues={keywordTags}
                  loadItemRekognitionTags={!keywordTags.length ? this.state.item.s3_key : ''}
                  callback={tagIds => this._isMounted ? this.setState({ item: { ...this.state.item, keyword_tags: tagIds ? tagIds : [] } }) : false}
                />
            </FormGroup>
          </Col>

          <Col xs="12">
            <FormGroup>
              <Label for="time_produced">Time Produced</Label>
              <Input type="date" id="time_produced" defaultValue={time_produced ? time_produced : new Date().toISOString().substr(0, 10)} />
            </FormGroup>

            <FormGroup>
              <Label for="location">Location</Label>
              <Select id="location" options={oceans} value={country_or_ocean ? {value: country_or_ocean, label: country_or_ocean} : []} onChange={e => this._isMounted ? this.setState({ item: { ...this.state.item, country_or_ocean: e.label  } }) : false} isSearchable/>
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
              <Select id="license_type" options={licenseType} value={license ? {value: license, label: license} : []} onChange={e => this._isMounted ? this.setState({ item: { ...this.state.item, license: e.label  } }) : false} isSearchable/>
            </FormGroup>

            <Button onClick={this.updateItem}>Update</Button>
          </Col>
        </Row>
      </Form>
    );
  }
}
