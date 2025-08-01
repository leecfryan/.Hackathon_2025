import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './Header.module.css';

const Header = () => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const extractUniversityFromEmail = (email) => {
    if (email && email.endsWith('.edu')) {
      const domain = email.split('@')[1];
      return domain.replace('.edu', '').replace(/\./g, ' ').toUpperCase();
    }
    return '';
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          <h1 className={styles.logoText}>SMOOFriends</h1>
          <span className={styles.logoSubtext}>University Social Network</span>
        </div>

        <div className={styles.userSection}>
          <div className={styles.userInfo}>
            <span className={styles.userName}>
              {user?.firstName} {user?.lastName}
            </span>
            <span className={styles.userUniversity}>
              {extractUniversityFromEmail(user?.email)}
            </span>
          </div>
          
          <div className={styles.userMenu}>
            <button 
              className={styles.userAvatar}
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </button>
            
            {showUserMenu && (
              <div className={styles.userDropdown}>
                <div className={styles.dropdownItem}>
                  <span>👤 Profile</span>
                </div>
                <div className={styles.dropdownItem}>
                  <span>⚙️ Settings</span>
                </div>
                <div className={styles.dropdownItem}>
                  <span>❓ Help</span>
                </div>
                <div className={styles.dropdownDivider}></div>
                <button 
                  className={styles.dropdownItem}
                  onClick={handleLogout}
                >
                  <span>🚪 Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
