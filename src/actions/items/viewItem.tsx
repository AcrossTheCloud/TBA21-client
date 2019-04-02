import { API } from 'aws-amplify';

export const FETCH_ITEM = 'FETCH_ITEM';
export const FETCH_ITEM_ERROR = 'FETCH_ITEM_ERROR';

export const fetchItem = (itemId) => dispatch => {
  if (!itemId) {
    dispatch({
     type: FETCH_ITEM,
     itemInformation: {},
   });
  }

  API.get('tba21', 'items', {
    queryStringParameters : {
      itemId: itemId
    }
  })
  .then((data) => {
    dispatch({
     type: FETCH_ITEM,
     itemInformation: data,
    });
  })
  .catch((e: any) => { // tslint:disable-line: no-any
    dispatch({
       type: FETCH_ITEM_ERROR
     });
  });
};

// {'urls': ['https://demo-content.ocean-archive.org/public/811af4d0-4e92-11e9-bedd-dbae63ceb8d7-IMAGE_12_DEVIL_Mobile_1024x768.jpg'], 'ocean': 'Pacific', 'privacy': false, 'timestamp': 1553472719.577, 'people': [{'personId': 'e21907f0-4e8c-11e9-998b-75f2374a0006', 'roles': [], 'personName': 'Dan'}], 'itemId': '9bb0fc90-4e92-11e9-9a47-5fc6e33f9664', 'description': 'Tasmanian Devil', 'position': [146.39218863044425, -84.06537814299026], 'tags': ['devil']}
