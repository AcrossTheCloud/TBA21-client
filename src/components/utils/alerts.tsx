import { Alert } from 'reactstrap';
import * as React from 'react';

export interface Alerts {
  errorMessage?: string | undefined;
  warningMessage?: string | undefined;
  successMessage?: string | undefined;
}

export const ErrorMessage = (props: {message: string | undefined}): JSX.Element => {
  return props.message === undefined ? <></> : <Alert color="danger">{props.message}</Alert>;
};
export const WarningMessage = (props: {message: string | undefined}): JSX.Element => {
  return props.message === undefined ? <></> : <Alert color="warning">{props.message}</Alert>;
};
export const SuccessMessage = (props: {message: string | undefined}): JSX.Element => {
  return props.message === undefined ? <></> : <Alert color="success">{props.message}</Alert>;
};
