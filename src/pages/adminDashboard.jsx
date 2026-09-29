function AdminDashboard() {
  return (
    <div className="dashboard">
      <h1>Admin Dashboard</h1>

      <p>Manage CampusConnect platform.</p>

      <div className="dashboard-cards">
        <div>Companies</div>
        <div>Colleges</div>
        <div>Verify Companies</div>
        <div>Verify Internships</div>
      </div>
    </div>
  );
}

export default AdminDashboard;