import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

/**
 * Reusable sortable table header.
 * @param {string} label - Display name
 * @param {string} field - Column field name
 * @param {string} sortBy - Current sort field
 * @param {string} order - 'asc' | 'desc'
 * @param {function} onSort - Callback(field)
 */
const SortableHeader = ({ label, field, sortBy, order, onSort }) => {
  const isActive = sortBy === field;
  const Icon = isActive
    ? (order === 'asc' ? ChevronUp : ChevronDown)
    : ChevronsUpDown;

  return (
    <th onClick={() => onSort(field)} style={{ cursor: 'pointer' }}>
      {label}{' '}
      <span className={`sort-icon ${isActive ? 'active' : ''}`}>
        <Icon size={12} />
      </span>
    </th>
  );
};

export default SortableHeader;
