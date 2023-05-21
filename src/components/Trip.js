export default function Trip(props)
{
    const formattedStartDate = new Date(props.startDate).toISOString().split("T")[0];
    const formattedEndDate = new Date(props.endDate).toISOString().split("T")[0];

    return (
        <div className={`trip-data-container background-${props.class}`}>
            <h3>{props.name}</h3>
            <p>Start date: {formattedStartDate}</p>
            <p>End date: {formattedEndDate}</p>
        </div>
    );
}