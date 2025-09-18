import React from 'react';
import '../styles/Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <h1>Mortgage Calculator</h1>
          </div>
          <nav className="nav">
            <a href="#calculator" className="nav-link">Calculator</a>
            <a href="#about" className="nav-link">About</a>
            <a href="#help" className="nav-link">Help</a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;