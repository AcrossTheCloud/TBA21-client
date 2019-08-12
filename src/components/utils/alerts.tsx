import { Alert } from 'reactstrap';
import * as React from 'react';

export interface Alerts {
  errorMessage?: string | JSX.Element | undefined;
  warningMessage?: string | JSX.Element | undefined;
  successMessage?: string | JSX.Element | undefined;
}

export const ErrorMessage = (props: {message: string | JSX.Element | undefined}): JSX.Element => {
  return props.message === undefined ? <></> : <Alert color="danger">{props.message}</Alert>;
};

/**
 * React hook shows an error alert and removes it after { time } or 2000
 * @param props { message: string, time: number in milliseconds }
 */
export const TimedErrorMessage = (props: {message: string | JSX.Element | undefined, time?: number}): JSX.Element => {
  const [ message, setMessage ] = React.useState(props.message);
  const [ time, setTime ] = React.useState(props.time);

  // If the message/time changes we need to update the state of the hook here first.
  React.useEffect(() => {
    setMessage(props.message);
    setTime(props.time ? props.time : 2000);
  },              [ props.time, props.message ]);

  // Remove the alert.
  React.useEffect(() => {
    const timer = setTimeout(() => { setMessage(undefined); }, time);
    return () => clearTimeout(timer);
  },              [ message, time ]);

  return message === undefined ? <></> : <Alert color="danger">{message}</Alert>;
};
export const WarningMessage = (props: {message: string | JSX.Element | undefined}): JSX.Element => {
  return props.message === undefined ? <></> : <Alert color="warning">{props.message}</Alert>;
};
export const SuccessMessage = (props: {message: string | JSX.Element | undefined}): JSX.Element => {
  return props.message === undefined ? <></> : <Alert color="success">{props.message}</Alert>;
};
