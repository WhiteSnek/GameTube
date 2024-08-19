import React from 'react';
import { RegisterTemplate } from "../../templates/user_template";

interface RegisterProps {
    userInfo: RegisterTemplate;
    setUserInfo: React.Dispatch<React.SetStateAction<RegisterTemplate>>;
    setActiveTab: React.Dispatch<React.SetStateAction<number>>;
}

const Page2: React.FC<RegisterProps> = ({ userInfo, setUserInfo, setActiveTab }) => {
    const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setActiveTab(3);
    };

    return (
        <form className="p-4 border-b-2  border-x-2 border-red-400 rounded-b-md" onSubmit={handleNext}>            
            <div className="mb-6">
                <label className="block text-white mb-2">Full Name:</label>
                <input 
                    type='text' 
                    value={userInfo.name} 
                    onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                    className="w-full p-3 rounded bg-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
            </div>

            <div className="mb-6">
                <label className="block text-white mb-2">Date of Birth:</label>
                <input 
                    type='date' 
                    value={userInfo.dob.toISOString().substring(0, 10)} 
                    onChange={(e) => setUserInfo({ ...userInfo, dob: new Date(e.target.value) })}
                    className="w-full p-3 rounded bg-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
            </div>

            <div className="mb-6">
                <label className="block text-white mb-2">Gender:</label>
                <select 
                    value={userInfo.gender} 
                    onChange={(e) => setUserInfo({ ...userInfo, gender: e.target.value })}
                    className="w-full p-3 rounded bg-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                    <option value="" disabled>Select your gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
            </div>

            <button 
                type="submit" 
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            >
                NEXT
            </button>
        </form>
    );
};

export default Page2;
