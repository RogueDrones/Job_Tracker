// # frontend/src/components/layout/Footer.jsx
import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-logo">
          <h3>Volunteer Job Tracker</h3>
          <p>Track your volunteer work efficiently</p>
        </div>
        
        <div className="footer-links">
          <ul>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/jobs">Jobs</a></li>
            <li><a href="/locations">Locations</a></li>
          </ul>
        </div>
        
        <div className="footer-legal">
          <p>&copy; {currentYear} Volunteer Job Tracker</p>
          <p>Dunedin, New Zealand</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
