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

    const
      params = {
        Bucket: config.s3.BUCKET,
        Key: key
      },
      head: HeadObjectOutput = await s3.headObject({ Bucket: config.s3.BUCKET , Key: key}).promise();

    if (head && ( head.ContentType && (head.ContentLength && head.ContentLength < 19865800) )) {
      const url = await s3.getSignedUrl('getObject', params);
      if (head.ContentType.includes('image')) {
        return {
          url: url,
          type: 'image',
          item_type: 'Image'
        };
      }

      if (head.ContentType.includes('audio')) {
        return {
          url: url,
          type: 'audio',
          item_type: 'Audio'
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
