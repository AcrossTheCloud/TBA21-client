import { Auth } from 'aws-amplify';
import { config as AWSConfig, S3 } from 'aws-sdk';
import { HeadObjectOutput } from 'aws-sdk/clients/s3';

import config from 'config';
import { S3File } from '../../types/s3File';

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

    const s3 = new S3(
      {
        params: {
          Bucket: config.s3.BUCKET
        }
      }
    );

    const head: HeadObjectOutput = await s3.headObject({ Bucket: config.s3.BUCKET , Key: key}).promise();

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
