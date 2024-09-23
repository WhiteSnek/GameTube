import React, { useState } from 'react';
import { RegisterTemplate } from '../../templates/user_template';
import { Link } from 'react-router-dom';
import Page1 from './Page1';
import Page2 from './Page2';
import Page3 from './Page3';

const RegisterBlock: React.FC = () => {
    const [userInfo, setUserInfo] = useState<RegisterTemplate>({
        username: '',
        password: '',
        email: '',
        name: '',
        dob: '',
        gender: '',
        avatar: null,
        avatarUrl: '',
        cover_image: null,
        cover_imageUrl: ''
    });
    const [activeTab, setActiveTab] = useState<number>(1)
    return (
        <div className="flex justify-center items-center max-w-xs mx-auto sm:max-w-xl bg-zinc-900">
            <div className='bg-zinc-800 p-8 rounded-lg border border-red-500 w-full max-w-xl'>
            <h1 className="text-lg sm:text-3xl text-red-500 mb-6 font-bold text-center">Register</h1>
            <div className='grid grid-cols-3 items-center text-red-400 font-bold text-lg'>
                <button onClick={() => setActiveTab(1)} className={`px-4 sm:text-lg text-xs py-2  text-center ${activeTab === 1 ? 'bg-zinc-800 border-t-2 border-x-2 rounded-t-lg' : 'bg-zinc-900 border-b-2'} border-red-400 transition-all`}>Account Details</button>
                <button onClick={() => setActiveTab(2)} className={`px-4 sm:text-lg text-xs py-2 text-center ${activeTab === 2 ? 'bg-zinc-800 border-t-2 border-x-2 rounded-t-lg' : 'bg-zinc-900 border-b-2'} border-red-400 transition-all`}>Personal Details</button>
                <button onClick={() => setActiveTab(3)} className={`px-4 sm:text-lg text-xs py-2 text-center ${activeTab === 3 ? 'bg-zinc-800 border-t-2 border-x-2 rounded-t-lg' : 'bg-zinc-900 border-b-2'} border-red-400 transition-all`}>Set Avatar</button>
            </div>
            {activeTab === 1 && <Page1 userInfo={userInfo} setUserInfo={setUserInfo} setActiveTab={setActiveTab}/>}
            {activeTab === 2 && <Page2 userInfo={userInfo} setUserInfo={setUserInfo} setActiveTab={setActiveTab}/>}
            {activeTab === 3 && <Page3 userInfo={userInfo} setUserInfo={setUserInfo}/>}
            <div className='flex flex-col gap-2 py-3 text-sm text-white'>
                    <Link to="/login" className="hover:text-gray-400">
                        Already have an account? Log in
                    </Link>
                </div>
                </div>
        </div>
    );
};

export default RegisterBlock;
