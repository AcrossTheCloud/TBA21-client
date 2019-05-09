import * as React from 'react';
import { Button } from 'reactstrap';
import { MdRefresh } from 'react-icons/md';

export default ({
  isLoading,
  text,
  loadingText,
  className = '',
  disabled = false,
  ...props
}) => (
    <React.Fragment>
      <Button
        className={`loaderButton ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <MdRefresh />}
        {!isLoading ? text : loadingText}
      </Button>
  </React.Fragment>
);
