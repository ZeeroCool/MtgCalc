import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Mortgage Calculator</h3>
            <p>Calculate your mortgage payments with precision and confidence.</p>
          </div>
          <div className="footer-section">
            <h4>Resources</h4>
            <ul>
              <li><a href="#rates">Current Rates</a></li>
              <li><a href="#guide">Buying Guide</a></li>
              <li><a href="#glossary">Glossary</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact</h4>
            <ul>
              <li><a href="#support">Support</a></li>
              <li><a href="#feedback">Feedback</a></li>
              <li><a href="#privacy">Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Mortgage Calculator. For educational purposes only.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;