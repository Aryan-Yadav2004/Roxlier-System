/**
 * Roxiler logo loaded directly from the official CDN URL.
 * Width/height are adjustable via props.
 */
const RoxilerLogo = ({ width = 100, height = 30, className = '' }) => (
  <img
    src="https://roxiler.com/wp-content/uploads/2024/06/Group.svg"
    alt="Roxiler"
    width={width}
    height={height}
    className={className}
    style={{ display: 'block', objectFit: 'contain' }}
  />
);

export default RoxilerLogo;
