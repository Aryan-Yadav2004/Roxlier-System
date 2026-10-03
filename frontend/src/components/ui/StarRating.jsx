/**
 * Star rating display or interactive component.
 * @param {number}   value     - Current rating value (1-5)
 * @param {boolean}  readOnly  - If true, non-interactive
 * @param {function} onChange  - Callback(rating) when interactive
 * @param {number}   size      - Font size override
 */
const StarRating = ({ value = 0, readOnly = false, onChange, size = 1.3 }) => {
  return (
    <div className="star-rating" role={readOnly ? 'img' : 'group'} aria-label={`Rating: ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= value ? 'filled' : ''}`}
          style={{
            fontSize: `${size}rem`,
            color: star <= value ? '#f59e0b' : '#374151',
            cursor: readOnly ? 'default' : 'pointer',
          }}
          onClick={!readOnly ? () => onChange?.(star) : undefined}
          role={!readOnly ? 'button' : undefined}
          aria-label={!readOnly ? `Rate ${star}` : undefined}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
