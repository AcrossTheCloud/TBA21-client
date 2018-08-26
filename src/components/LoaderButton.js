import * as React from 'react';
import { Button } from 'reactstrap';
import { MdRefresh } from 'react-icons/md';
import './LoaderButton.css';

export default ({
  isLoading,
  text,
  loadingText,
  className = '',
  disabled = false,
  ...props
}) =>
  <Button
    className={`LoaderButton ${className}`}
    disabled={disabled || isLoading}
    {...props}
  >
    {isLoading && <MdRefresh glyph='refresh' className='spinning' />}
    {!isLoading ? text : loadingText}
  </Button>;
