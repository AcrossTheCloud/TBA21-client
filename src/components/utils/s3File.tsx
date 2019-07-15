import { Storage } from 'aws-amplify';
import { CognitoIdentityCredentials, config as AWSConfig, S3 } from 'aws-sdk';
import config from 'config';
import { S3File } from '../../types/s3File';

export const storageGet = async (key: string): Promise<S3File | false> => {
  const result: any = await Storage.get(key, {level: 'private', download: true}); // tslint:disable-line: no-any
  if (result.ContentType.includes('image')) {
    const blob = new Blob([ result.Body ], { type: result.ContentType });
    return {
      blobURL: window.URL.createObjectURL(blob),
      type: 'image'
    };
  } else {
    return false;
  }
};

export const sdkGetObject = async (key: string): Promise<S3File | false> => {
  AWSConfig.update({
   region: config.s3.REGION,
   credentials: new CognitoIdentityCredentials({
    IdentityPoolId: config.cognito.IDENTITY_POOL_ID
   })
 });

  const s3 = new S3(
    {
      params: {
        Bucket: config.s3.BUCKET
      }
    }
  );

  const result: any = await s3.getObject({ Bucket: config.s3.BUCKET , Key: key}).promise(); // tslint:disable-line: no-any
  if (result.ContentType.includes('image')) {
    const blob = new Blob([ result.Body ], { type: result.ContentType });
    return {
      blobURL: window.URL.createObjectURL(blob),
      type: 'image'
    };
  } else {
    return false;
  }
};
