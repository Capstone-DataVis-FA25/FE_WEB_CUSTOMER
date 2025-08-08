import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto py-4 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Your Company Name. All rights reserved.
        </p>
        <p className="text-xs">Built with ❤️ using React and Tailwind CSS.</p>
      </div>
    </footer>
  );
};

export default Footer;
