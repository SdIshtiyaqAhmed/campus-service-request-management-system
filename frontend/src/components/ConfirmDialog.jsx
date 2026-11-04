import './ConfirmDialog.css';

const ConfirmDialog = ({
    title,
    currentStaff,
    newStaff,
    confirmLabel = 'Confirm',
    confirming = false,
    onCancel,
    onConfirm
}) => {
    return (
        <div
            className="confirm-dialog-backdrop"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !confirming) {
                    onCancel();
                }
            }}
        >
            <div
                className="confirm-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
            >
                <div className="confirm-dialog-header">
                    <h2 id="confirm-dialog-title">{title}</h2>
                </div>

                <div className="confirm-dialog-body">
                    <p>
                        Please confirm that you want to change the
                        assignment.
                    </p>

                    <div className="confirm-dialog-assignment">
                        <div>
                            <span>Currently assigned to</span>
                            <strong>
                                {currentStaff || 'Not assigned'}
                            </strong>
                        </div>

                        <div>
                            <span>New staff member</span>
                            <strong>{newStaff}</strong>
                        </div>
                    </div>
                </div>

                <div className="confirm-dialog-actions">
                    <button
                        type="button"
                        className="button button-secondary"
                        onClick={onCancel}
                        disabled={confirming}
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        className="button button-primary"
                        onClick={onConfirm}
                        disabled={confirming}
                    >
                        {confirming ? 'Saving...' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;



