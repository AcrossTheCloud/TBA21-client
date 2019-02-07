import { Button } from 'reactstrap';
import { MdRefresh } from 'react-icons/md';

export default ({
  isLoading,
  text,
  loadingText,
  className = '',
  disabled = false,
  ...props
}) =>
  <Button
    className={`loaderButton ${className}`}
    disabled={disabled || isLoading}
    {...props}
  >
    {isLoading && <MdRefresh glyph='refresh' className='spinning' />}
    {!isLoading ? text : loadingText}
  </Button>;
