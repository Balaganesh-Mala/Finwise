import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TrainerNavbar from '../components/TrainerNavbar';

const TrainerLayout = () => {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <TrainerNavbar />
                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default TrainerLayout;
