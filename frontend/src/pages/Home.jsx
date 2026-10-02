import { Link } from "react-router-dom";

function Home() {
  return (
    <main className="hero">
      <div className="hero-content">
        <p className="tagline">Smart Local-Issue Reporting</p>

        <h1>
          Report local issues.
          <br />
          Make your community better.
        </h1>

        <p className="description">
          CivicPulse LK connects citizens, field officers and local authorities
          to report, track and resolve community issues.
        </p>

        <div className="hero-buttons">
          <Link to="/login" className="primary-btn">
            Report an Issue
          </Link>

          <Link to="/issues" className="secondary-btn">
            View Issues
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Home;