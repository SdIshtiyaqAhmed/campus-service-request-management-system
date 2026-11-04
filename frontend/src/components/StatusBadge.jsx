const StatusBadge = ({ status }) => {
    const label = status
        ? status.replace('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
        : 'Unknown';

    return (
        <span className={`status-badge status-${status || 'unknown'}`}>
            {label}
        </span>
    );
};

export default StatusBadge;
