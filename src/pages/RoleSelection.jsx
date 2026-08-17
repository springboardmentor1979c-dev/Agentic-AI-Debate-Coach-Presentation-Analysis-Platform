import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import { IoPerson, IoGlasses, IoSchool, IoSettings } from 'react-icons/io5';

const RoleSelection = () => {
  const { changeRole, user } = useAuth();
  const navigate = useNavigate();

  const roles = [
    {
      id: 'learner',
      title: 'Learner / Debater',
      desc: 'Simulate live debate rounds, upload presentation files, scan arguments for fallacies, and manage your personalized coaching path.',
      icon: IoPerson,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'coach',
      title: 'Debate Coach',
      desc: 'Monitor student development checklists, review speaker logs, manage assignments, and run comparative growth analytics.',
      icon: IoGlasses,
      color: 'from-indigo-500 to-violet-500',
    },
    {
      id: 'educator',
      title: 'Educator',
      desc: 'Manage high-school or collegiate classrooms, oversee team-wide leaderboards, view reports, and direct lesson metrics.',
      icon: IoSchool,
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'admin',
      title: 'Platform Admin',
      desc: 'Track AI LLM model latency systems, manage system permissions, view platform-wide server logs, and monitor billing / API limits.',
      icon: IoSettings,
      color: 'from-slate-700 to-slate-900 dark:from-slate-650 dark:to-slate-800',
    },
  ];

  const handleSelectRole = async (roleId) => {
    try {
      // Save selected role locally
      changeRole(roleId);

      // Later we will update the role in the backend
      // await api.put("/users/change-role", { role: roleId });

      navigate(`/${roleId}/dashboard`);
    } catch (error) {
      console.error("Role selection failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkbg-base flex relative overflow-hidden items-center justify-center p-6 md:p-12">
      <div className="absolute top-[20%] left-[10%] w-96 h-96 rounded-full bg-blue-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full bg-purple-500/10 blur-[130px] pointer-events-none" />

      <div className="max-w-5xl w-full text-center relative z-10">
        <div className="mb-12">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold mx-auto mb-4 shadow-lg shadow-indigo-500/20">
            🧠
          </div>

          <h2 className="font-display font-black text-3xl md:text-5xl text-slate-900 dark:text-white leading-tight">
            Choose Your Profile Portal
          </h2>

          <p className="text-sm md:text-base text-slate-550 dark:text-slate-400 mt-3 max-w-lg mx-auto leading-relaxed">
            Welcome,{" "}
            <span className="font-bold text-slate-850 dark:text-slate-200">
              {user?.full_name || "Debater"}
            </span>
            . Select your profile viewpoint to load the customized dashboard
            console.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {roles.map((roleObj) => {
            const Icon = roleObj.icon;

            return (
              <Card
                key={roleObj.id}
                onClick={() => handleSelectRole(roleObj.id)}
                hoverEffect={true}
                variant="deep"
                className="flex gap-5 text-left items-start p-6 md:p-8 cursor-pointer"
              >
                <div
                  className={`p-4 rounded-2xl bg-gradient-to-tr ${roleObj.color} text-white shadow-lg`}
                >
                  <Icon className="h-6 w-6" />
                </div>

                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg text-slate-850 dark:text-slate-100 mb-2">
                    {roleObj.title}
                  </h3>

                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    {roleObj.desc}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;