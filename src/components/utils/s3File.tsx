import { Auth } from 'aws-amplify';
import { config as AWSConfig, S3 } from 'aws-sdk';
import { HeadObjectOutput } from 'aws-sdk/clients/s3';

import config from 'config';
import { S3File } from '../../types/s3File';

export const fileType = (type: string): 'video' | 'text' | 'audio' | 'image' | null => {
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types
  const textTypes = [
    'text',
    'msword',
    'vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'vnd.ms-', // vnd.ms-powerpoint , excel etc
    'vnd.openxmlformats', // pptx powerpoint
    'vnd.oasis.opendocument', // OpenDocument
    'epub+zip',
    'rtf', // Rich text
    'xml',
    'vnd.amazon',
  ];
  if (type.includes('image')) {
    return 'image';
  } else if (type.includes('audio')) {
    return 'audio';
  } else if (type.includes('video')) {
    return 'video';
  } else if (textTypes.some(el => type.includes(el))) {
    return 'text';
  } else {
    return null;
  }
};

/**
 *
 * Gets the S3 Object from any UUID "folder"
 *
 * Converts it to a URL if the contentType is an image.
 *
 * @param key { string }
 */
export const getCDNObject = async (key: string): Promise<S3File | false> => {
  try {

    const
      url = `${config.other.BASE_CONTENT_URL}${key}`,
      result = await fetch(url, {
        mode: 'cors',
        method: 'HEAD'
      });

    let contentType: string | null = null;

    if (result.headers) {
      contentType = result.headers.get('content-type');
    }

    if (result && contentType !== null) {
      const type = fileType(contentType);
      if (type) {
        return {
          url,
          type
        };
      }
    }

    return false;

    // return await contentType();
  } catch (e) {
    console.log('e', e);
    return false;
  }
};

/**
 *
 * Gets the S3 Object from any UUID "folder"
 *
 * Converts it to a URL if the contentType is an image.
 *
 * @param key { string }
 */
export const sdkGetObject = async (key: string): Promise<S3File | false> => {
  try {

    if (!AWSConfig.credentials) {
      AWSConfig.credentials = await Auth.currentCredentials();
    } else {
      AWSConfig.update({
       credentials: await Auth.currentCredentials()
     });
    }

    if (head && ( head.ContentType && (head.ContentLength && head.ContentLength < 19865800) )) {
      const
        type = head.ContentType,
        url = `${config.other.BASE_CONTENT_URL}${key}`; // Set the URL as the Cloudfront CDN URL
      if (type.includes('image')) {
        return {
          url: url,
          type: 'image',
          item_type: 'Image'
        };
      }

      if (type.includes('audio')) {
        return {
          url: url,
          type: 'audio',
          item_type: 'Audio'
        };
      }

      if (type.includes('video')) {
        return {
          url: url,
          type: 'video',
          item_type: 'Video'
        };
      }

      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types
      const textTypes = [
        'text',
        'msword',
        'vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
        'vnd.ms-', // vnd.ms-powerpoint , excel etc
        'vnd.openxmlformats', // pptx powerpoint
        'vnd.oasis.opendocument', // OpenDocument
        'epub+zip',
        'rtf', // Rich text
        'xml',
        'vnd.amazon',
      ];
      if (textTypes.some(el => type.includes(el))) {
        return {
          url: url,
          type: 'text',
          item_type: 'Text'
        };
      }

      return false;
    } else {
      return false;
    }

    // return await contentType();
  } catch (e) {
    console.log('e', e);
    return false;
  }
};
