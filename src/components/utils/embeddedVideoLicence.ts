import { License } from 'types/License';

import { first, last } from 'lodash-es';

import config from '../../config.js';


const getYTLicence = async (id: string) : Promise<License> => {
 
  const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${id}&part=status&key=${config.auth.GOOGLE_API_KEY}`);
  switch ((await response.json()).items[0].status.license) {
    case 'youtube':
      return License.YT;
    case 'creativeCommon': // YT only has CC_BY:
      return License.CC_BY;
  }
  return License.YT;

}

export const getLicence = async (url: string) : Promise<License> => {
  console.log('getting licence for ', url);
  if (url.startsWith('https://www.youtube.com') || url.startsWith('https://youtube.com')) {
    const videoId=first(last(url.split('v=')).split('?'));
    return getYTLicence(videoId);
  } else if (url.startsWith('https://youtu.be')) {
    const videoId=first(last(url.split('/')).split('?'));
    return getYTLicence(videoId);
  } else if (url.startsWith('https://www.vimeo') || url.startsWith('https://vimeo')) {
    const videoId=first(last(url.split('/')).split('?'));
    const response = await fetch(`https://api.vimeo.com/videos/${videoId}`, {
      method: 'GET', // *GET, POST, PUT, DELETE, etc.
      mode: 'cors', // no-cors, *cors, same-origin
      credentials: 'same-origin', // include, *same-origin, omit
      headers: {
        'Authorization': 'Bearer ' + config.auth.VIMEO_BEARER_TOKEN
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    //console.log(await response.json());

    switch ((await response.json()).license) {
      case 'by':
        return License.CC_BY;
      case 'by-sa':
        return License.CC_BY_SA;
      case 'by-nd':
        return License.CC_BY_ND;
      case 'by-nc':
        return License.CC_BY_NC;
      case 'by-nc-sa':
        return License.CC_BY_NC_SA;
      case 'by-nc-nd':
        return License.CC_BY_NC_ND;
      case 'cc0':
        return License.CC0;
    }
    console.log('returning License.VM');
    return License.VM;
  }

  return License.OA;
}
