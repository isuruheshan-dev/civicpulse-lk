import { Link } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import OfficerDashboard from "./OfficerDashboard";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user?.role === "admin") {
  return <AdminDashboard />;
}

  if (user?.role === "field_officer") {
    return <OfficerDashboard />;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-label">CivicPulse LK</p>

          <h1>
            Welcome {user?.full_name || user?.name || "Citizen"} 👋
          </h1>

          <p>
            Report community issues and track their progress.
          </p>
        </div>
      </div>

      <div className="dashboard-cards">
        <Link to="/issues" className="dashboard-card">
          <h2>View Issues</h2>
          <p>
            See reported community issues and their current status.
          </p>
          <span>View Issues →</span>
        </Link>

        <Link to="/report-issue" className="dashboard-card">
          <h2>Report Issue</h2>
          <p>
            Submit a new local issue to CivicPulse.
          </p>
          <span>Report Issue →</span>
        </Link>

        <div className="dashboard-card">
          <h2>My Account</h2>

          <p>
            Email: {user?.email || "Not available"}
          </p>

          <p>
            Role: {user?.role || "citizen"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;