const PriorityBadge = ({ priority }) => {
    const label = priority
        ? priority.charAt(0).toUpperCase() + priority.slice(1)
        : 'Unknown';

    return (
        <span className={`priority-badge priority-${priority || 'unknown'}`}>
            {label}
        </span>
    );
};

export default PriorityBadge;
