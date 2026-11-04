const StatCard = ({ label, value, description }) => {
    return (
        <article className="stat-card">
            <p className="stat-label">{label}</p>
            <p className="stat-value">{value}</p>

            {description && (
                <p className="stat-description">{description}</p>
            )}
        </article>
    );
};

export default StatCard;
