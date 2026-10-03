import { X } from 'lucide-react';

const Modal = ({ title, onClose, children, width = 500 }) => (
  <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div className="modal" style={{ maxWidth: width }}>
      <div className="modal-header">
        <h3 className="modal-title">{title}</h3>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <X size={16} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default Modal;
