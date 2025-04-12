import { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function About() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">Consin</span>
              </div>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
              <Link to="/" className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                Home
              </Link>
              <Link to="/about" className="px-3 py-2 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600">
                About
              </Link>
              {isAuthenticated ? (
                <Link 
                  to={user?.role === 'admin' ? '/admin' : user?.role === 'supervisor' ? '/supervisor' : '/student'} 
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Dashboard
                </Link>
              ) : (
                <div className="flex space-x-4">
                  <Link to="/login" className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50">
                    Sign in
                  </Link>
                  <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Register
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link to="/" className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-l-4 hover:border-gray-300">
                Home
              </Link>
              <Link to="/about" className="block px-3 py-2 text-base font-medium text-indigo-600 bg-indigo-50 border-l-4 border-indigo-500">
                About
              </Link>
              {isAuthenticated ? (
                <Link 
                  to={user?.role === 'admin' ? '/admin' : user?.role === 'supervisor' ? '/supervisor' : '/student'} 
                  className="block px-3 py-2 text-base font-medium text-indigo-600 hover:bg-indigo-50 hover:border-l-4 hover:border-indigo-300"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-l-4 hover:border-gray-300">
                    Sign in
                  </Link>
                  <Link to="/register" className="block px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-l-4 hover:border-gray-300">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <div className="flex-grow bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              About CodingMaster'2025
            </h1>
            <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
              Learn more about the hackathon and our platform
            </p>
          </div>

          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-2xl font-bold text-gray-900">The Hackathon</h2>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <p className="text-gray-600 mb-4">
                CodingMaster'2025 is an annual hackathon that brings together talented developers, designers, and innovators to create cutting-edge solutions to real-world problems.
              </p>
              <p className="text-gray-600 mb-4">
                The hackathon spans over 48 hours of intense coding, collaboration, and creativity. Participants form teams and work on projects that are evaluated by industry experts. The best projects receive recognition, prizes, and opportunities for further development.
              </p>
              <p className="text-gray-600 mb-4">
                Whether you're a seasoned developer or just starting your coding journey, CodingMaster'2025 offers a platform to learn, collaborate, and showcase your skills.
              </p>
            </div>
          </div>

          <div className="mt-8 bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-2xl font-bold text-gray-900">Our Platform</h2>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <p className="text-gray-600 mb-4">
                The Consin platform is designed to streamline the project registration and management process for the CodingMaster'2025 hackathon.
              </p>
              <p className="text-gray-600 mb-4">
                Key features of our platform include:
              </p>
              <ul className="list-disc pl-5 mb-4 text-gray-600 space-y-2">
                <li>Easy project registration and submission</li>
                <li>Team member management</li>
                <li>Real-time project status tracking</li>
                <li>PDF export functionality for project details</li>
                <li>Dedicated dashboards for students, supervisors, and administrators</li>
              </ul>
              <p className="text-gray-600">
                Our goal is to provide a seamless experience for all participants, allowing them to focus on what matters most - building amazing projects.
              </p>
            </div>
          </div>

          <div className="mt-8 bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <p className="text-gray-600 mb-4">
                If you have any questions or need assistance, please don't hesitate to reach out to us.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Email</h3>
                  <p className="text-indigo-600">contact@codingmaster2025.com</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Phone</h3>
                  <p className="text-indigo-600">+1 (123) 456-7890</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
            <div className="px-5 py-2">
              <Link to="/" className="text-base text-gray-500 hover:text-gray-900">
                Home
              </Link>
            </div>

            <div className="px-5 py-2">
              <Link to="/about" className="text-base text-gray-500 hover:text-gray-900">
                About
              </Link>
            </div>

            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                Terms
              </a>
            </div>

            <div className="px-5 py-2">
              <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                Privacy
              </a>
            </div>
          </nav>
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; 2023 CodingMaster'2025. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
