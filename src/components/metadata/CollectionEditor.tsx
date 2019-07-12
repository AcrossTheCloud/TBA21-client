import * as React from 'react';
import { Button, Col, Container, Form, FormGroup, Input, Label, Row } from 'reactstrap';
import Tags from './Tags';
import Select from 'react-select';
import { itemTextSubTypes, licenseType, oceans } from './SelectOptions';
import { Collection } from '../../types/Collection';
import { Items } from './Items';
import { API } from 'aws-amplify';
import { Item } from '../../types/Item';

interface Props {
  collection?: Collection;
  editMode: boolean;
}

interface State {
  collection: Collection;
  itemsS3Keys: string[];

  // If we're editing the collection, we'll do an API call to get the items and push them to <Items />
  loadedItems: Item[];
  loadingItems: boolean;
}

export class CollectionEditor extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      collection: props.collection || {},
      itemsS3Keys: [],
      loadedItems: [],
      loadingItems: !!props.collection
    };
  }

  componentDidMount() {
    if (this.props.collection) {
      const getItemsInCollection = async (id) => {
        const results = await API.get('tba21', 'admin/collections/getItemsInCollection', {
          queryStringParameters: {
            id: id
          }
        });

        if (results && results.items && results.items.length) {
          this.setState(
            {
              itemsS3Keys: results.items.map( i => i.s3_key),
              loadedItems: results.items,
              loadingItems: false
            }
          );
        }
      };

      getItemsInCollection(this.props.collection.id);

      // do a call for the items
      // put the s3-key into itemsS3Keys
      // send the items to state and push through props to <Items/>
    }
  }

  putCollection = async () => {
    const collectionProperties = {};
    try {
      Object.entries(this.state.collection)
        .filter(([key, value]) => {
          return !(
            value === null ||
            key === 'count' || key === 'image_hash' ||
            key === 'sha512' || key === 'aggregated_keyword_tags' ||
            key === 'aggregated_concept_tags' || key === 'md5' ||
            key === 'created_at' || key === 'updated_at' || key === 'machine_recognition_tags'
          );
        })
        .forEach(prop => {
          Object.assign(collectionProperties, {[prop[0]]: prop[1]});
        });

      if (this.state.itemsS3Keys.length) {
        Object.assign(collectionProperties, {'items': this.state.itemsS3Keys});
      }

      API.put('tba21', `admin/collections/${this.props.editMode ? 'update' : 'create'}`, {
        body: {
          ...collectionProperties
        }
      });
    } catch (e) {
      console.log('ERROR - ', e);
    }
  }

  itemsCallback = (s3key: string) => {
    console.log('Hi', s3key, this.state.itemsS3Keys.indexOf(s3key));
    if (this.state.itemsS3Keys.indexOf(s3key) === -1) {
      this.setState({ itemsS3Keys: [...this.state.itemsS3Keys, s3key] });
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

    } = this.state.collection;

    const keywordTags = aggregated_keyword_tags ? aggregated_keyword_tags.map( t => ({ id: t.id, value: t.id, label: t.tag_name}) ) : [];

    return (
      <Container>
        <Row>
          <Form className="container-fluid">
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label for="title">Title</Label>
                  <Input id="title" defaultValue={title ? title : ''} onChange={e => this.setState({ collection: { ...this.state.collection, title: e.target.value } })}/>
                </FormGroup>

                <FormGroup>
                  <Label for="description">Description</Label>
                  <Input type="textarea" id="description" defaultValue={description ? description : ''} onChange={e => this.setState({ collection: { ...this.state.collection, description: e.target.value } })}/>
                </FormGroup>

                <FormGroup>
                  <Label for="status">Status</Label>
                  <Input
                    type="select"
                    name="status"
                    onChange={e => this.setState({ collection: { ...this.state.collection, status: e.target.value === 'true' } })}
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
                    <Tags
                      className="keyword_tags"
                      type="keyword"
                      defaultValues={keywordTags}
                      callback={tagIds => this.setState({ collection: { ...this.state.collection, keyword_tags: tagIds ? tagIds : [] } })}
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
                  <Select id="location" options={oceans} value={country_or_ocean ? {value: country_or_ocean, label: country_or_ocean} : []} onChange={e => this.setState({ collection: { ...this.state.collection, country_or_ocean: e.label  } })} isSearchable/>
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
                  <Select id="license_type" options={licenseType} value={license ? {value: license, label: license} : []} onChange={e => this.setState({ collection: { ...this.state.collection, license: e.label  } })} isSearchable/>
                </FormGroup>

                <Button onClick={this.putCollection}>Create</Button>
              </Col>
            </Row>
          </Form>
        </Row>
        <Row>
          {
            this.state.loadingItems ?
              <>Loading</>
              :
              <Items callback={this.itemsCallback} items={this.state.loadedItems}/>
          }
        </Row>
      </Container>
    );
  }
}
