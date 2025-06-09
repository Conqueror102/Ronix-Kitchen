import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../features/authSlice';

export default function RegisterBtn() {
    const isAuthenticated = useSelector(selectIsAuthenticated);

    if (isAuthenticated) {
        return null; // Don't show register button if user is authenticated
    }

    return (
        <Link
            to="/auth/signup"
            className="flex items-center space-x-2 py-2 px-3 bg-vibrantOrange hover:bg-vibrantOrange/90 text-white rounded-lg transition-colors focus:outline-none"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span>Register</span>
        </Link>
    );
}
