import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-8 text-center text-slate-500 dark:text-slate-400 text-sm">
      <p>&copy; {new Date().getFullYear()} Snakes & Ladders. All rights reserved.</p>
    </footer>
  );
};

export default Footer;