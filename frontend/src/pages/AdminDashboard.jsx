import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function AdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [stats, setStats] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [selectedOfficers, setSelectedOfficers] = useState({});
  const [message, setMessage] = useState("Loading admin dashboard...");
  const [actionMessage, setActionMessage] = useState("");

  const token = localStorage.getItem("token");

  // -----------------------------
  // Fetch dashboard statistics
  // -----------------------------
  const fetchAdminStats = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to load dashboard.");
        return;
      }

      setStats(data);
      setMessage("");
    } catch (error) {
      console.error(error);
      setMessage("Could not connect to the server.");
    }
  };

  // -----------------------------
  // Fetch field officers
  // -----------------------------
  const fetchOfficers = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/officers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setOfficers(data);
      }
    } catch (error) {
      console.error("Officer fetch error:", error);
    }
  };

  useEffect(() => {
    fetchAdminStats();
    fetchOfficers();
  }, []);

  // -----------------------------
  // Assign issue
  // -----------------------------
  const handleAssign = async (issueId) => {
    const officerId = selectedOfficers[issueId];

    if (!officerId) {
      setActionMessage("Please select an officer first.");
      return;
    }

    try {
      setActionMessage("Assigning issue...");

      const response = await fetch(
        `http://localhost:5000/api/admin/issues/${issueId}/assign`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            officer_id: Number(officerId),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setActionMessage(
          data.message || "Failed to assign issue."
        );
        return;
      }

      setActionMessage(
        `Issue #${issueId} assigned to ${data.officer.full_name} successfully.`
      );

      // Refresh dashboard so status changes to assigned
      await fetchAdminStats();

    } catch (error) {
      console.error("Assign issue error:", error);

      setActionMessage(
        "Could not connect to the server."
      );
    }
  };

  if (!stats) {
    return (
      <div className="dashboard-page">
        <h2>{message}</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <p className="dashboard-label">
            CivicPulse LK Admin
          </p>

          <h1>
            Welcome{" "}
            {user?.full_name ||
              user?.name ||
              "Admin"}{" "}
            👋
          </h1>

          <p>
            Monitor community reports and manage
            CivicPulse operations.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="dashboard-cards">

        <div className="dashboard-card">
          <h2>{stats.totalIssues}</h2>
          <p>Total Issues</p>
        </div>

        <div className="dashboard-card">
          <h2>{stats.openIssues}</h2>
          <p>Open Issues</p>
        </div>

        <div className="dashboard-card">
          <h2>{stats.resolvedIssues}</h2>
          <p>Resolved Issues</p>
        </div>

        <div className="dashboard-card">
          <h2>{stats.highPriorityIssues}</h2>
          <p>High Priority</p>
        </div>

      </div>

      {/* Categories */}
      <div className="dashboard-section">

        <h2>Issues by Category</h2>

        <div className="dashboard-cards">

          {stats.issuesByCategory?.map((category) => (
            <div
              className="dashboard-card"
              key={category.id}
            >
              <h3>{category.category}</h3>

              <h2>{category.count}</h2>

              <p>Reported issues</p>
            </div>
          ))}

        </div>
      </div>

      {/* Assignment message */}
      {actionMessage && (
        <p style={{ marginTop: "20px" }}>
          {actionMessage}
        </p>
      )}

      {/* Recent Issues */}
      <div className="dashboard-section">

        <h2>Recent Issues</h2>

        {stats.recentIssues?.length === 0 ? (
          <p>No issues available.</p>
        ) : (

          <div className="dashboard-cards">

            {stats.recentIssues?.map((issue) => (

              <div
                className="dashboard-card"
                key={issue.id}
              >

                <p>Issue #{issue.id}</p>

                <h3>{issue.title}</h3>

                <p>
                  Priority: {issue.priority}
                </p>

                <p>
                  Status: {issue.status}
                </p>

                <Link to={`/issues/${issue.id}`}>
                  View Issue →
                </Link>

                <div
                  style={{
                    marginTop: "20px",
                  }}
                >

                  <select
                    value={
                      selectedOfficers[issue.id] || ""
                    }
                    onChange={(e) =>
                      setSelectedOfficers({
                        ...selectedOfficers,
                        [issue.id]: e.target.value,
                      })
                    }
                  >

                    <option value="">
                      Select Field Officer
                    </option>

                    {officers.map((officer) => (
                      <option
                        key={officer.id}
                        value={officer.id}
                      >
                        {officer.full_name}
                      </option>
                    ))}

                  </select>

                  <button
                    onClick={() =>
                      handleAssign(issue.id)
                    }
                    style={{
                      marginLeft: "10px",
                    }}
                  >
                    {issue.status === "assigned"
                      ? "Reassign"
                      : "Assign"}
                  </button>

                </div>

              </div>

            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default AdminDashboard;