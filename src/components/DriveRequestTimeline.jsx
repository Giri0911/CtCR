function DriveRequestTimeline({ adminStatus, companyStatus }) {
  const reviewStatus = adminStatus || "approved";
  const reviewState = reviewStatus === "pending"
    ? "current"
    : reviewStatus === "rejected"
      ? "rejected"
      : "complete";
  const companyState = reviewStatus === "rejected"
    ? "locked"
    : reviewStatus !== "approved"
      ? "locked"
      : companyStatus === "accepted"
        ? "complete"
        : companyStatus === "rejected"
          ? "rejected"
          : "current";
  const companyDetail = reviewStatus === "rejected"
    ? "Not sent to company"
    : reviewStatus !== "approved"
      ? "Available after admin approval"
      : companyStatus === "accepted"
        ? "Accepted"
        : companyStatus === "rejected"
          ? "Declined"
          : "Awaiting response";

  return (
    <ol className="drive-request-timeline" aria-label="Drive request progress">
      <li className="drive-timeline-step step-complete">
        <span>1</span>
        <div><strong>Submitted</strong><small>Request received</small></div>
      </li>
      <li className={`drive-timeline-step step-${reviewState}`}>
        <span>2</span>
        <div>
          <strong>Admin review</strong>
          <small>{reviewStatus === "approved" ? "Approved" : reviewStatus === "rejected" ? "Not approved" : "In review"}</small>
        </div>
      </li>
      <li className={`drive-timeline-step step-${companyState}`}>
        <span>3</span>
        <div><strong>Company response</strong><small>{companyDetail}</small></div>
      </li>
    </ol>
  );
}

export default DriveRequestTimeline;
