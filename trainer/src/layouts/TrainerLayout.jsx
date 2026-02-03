import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TrainerNavbar from '../components/TrainerNavbar';

const TrainerLayout = () => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <TrainerNavbar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-y-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default TrainerLayout;
