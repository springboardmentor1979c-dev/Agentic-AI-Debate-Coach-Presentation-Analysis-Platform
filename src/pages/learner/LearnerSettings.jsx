import React, { useState } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Toast from '../../components/Toast';
import { useTheme } from '../../context/ThemeContext';
import { IoSunny, IoMoon, IoLockClosed, IoLanguage, IoVolumeHigh, IoSave } from 'react-icons/io5';

const LearnerSettings = () => {
  const { isDark, toggleTheme } = useTheme();
  const [lang, setLang] = useState('English (US)');
  const [saveLogs, setSaveLogs] = useState(true);
  const [allowReview, setAllowReview] = useState(true);
  const [speechSynth, setSpeechSynth] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setToastVisible(true);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="font-display font-black text-2xl md:text-3xl text-slate-900 dark:text-white">
          Account Settings
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure visual themes, speech processing, and account access permissions.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Theme Settings */}
        <Card variant="glass" hoverEffect={false}>
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">Visual Theme</h3>
              <p className="text-[10px] text-slate-450 font-semibold">Switch between dark space mode and clear light mode</p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-darkbg-border hover:bg-slate-50 dark:hover:bg-darkbg-accent text-xs font-bold flex items-center gap-2 transition-all text-slate-800 dark:text-slate-200"
            >
              {isDark ? (
                <>
                  <IoSunny className="text-amber-400 h-4.5 w-4.5" /> Light Mode
                </>
              ) : (
                <>
                  <IoMoon className="text-indigo-600 h-4.5 w-4.5" /> Dark Mode
                </>
              )}
            </button>
          </div>
        </Card>

        {/* Speech & Audio settings */}
        <Card variant="glass" hoverEffect={false} className="space-y-5">
          <div className="border-b border-slate-100 dark:border-darkbg-border pb-4">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">Speech & Language Configuration</h3>
            <p className="text-[10px] text-slate-450 font-semibold">Review speech synthesis and translation models</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">System Language</label>
              <span className="text-[10px] text-slate-450 font-semibold block mt-0.5">Used for UI translation and AI speech synthesis</span>
            </div>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-white dark:bg-darkbg-accent border border-slate-200 dark:border-darkbg-border rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none w-48"
            >
              <option>English (US)</option>
              <option>English (UK)</option>
              <option>Spanish (LatAm)</option>
              <option>French (Europe)</option>
            </select>
          </div>

          <hr className="border-slate-100 dark:border-darkbg-border" />

          {/* Toggle 1 */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">AI Speech Voice Feedback</span>
              <span className="text-[10px] text-slate-450 font-semibold block mt-0.5">Generates voice responses during debate matches</span>
            </div>
            <input 
              type="checkbox" 
              checked={speechSynth}
              onChange={(e) => setSpeechSynth(e.target.checked)}
              className="h-4.5 w-4.5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>
        </Card>

        {/* Data & Privacy Settings */}
        <Card variant="glass" hoverEffect={false} className="space-y-5">
          <div className="border-b border-slate-100 dark:border-darkbg-border pb-4">
            <h3 className="font-display font-bold text-base text-slate-800 dark:text-slate-200">Data Sharing & Privacy</h3>
            <p className="text-[10px] text-slate-450 font-semibold">Control what data is stored on our servers</p>
          </div>

          {/* Toggle 2 */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Save debate transcript logs</span>
              <span className="text-[10px] text-slate-450 font-semibold block mt-0.5">Allows exporting text histories later</span>
            </div>
            <input 
              type="checkbox" 
              checked={saveLogs}
              onChange={(e) => setSaveLogs(e.target.checked)}
              className="h-4.5 w-4.5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>

          <hr className="border-slate-100 dark:border-darkbg-border" />

          {/* Toggle 3 */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Allow Coach Review</span>
              <span className="text-[10px] text-slate-450 font-semibold block mt-0.5">Makes transcripts visible in the Coach panel</span>
            </div>
            <input 
              type="checkbox" 
              checked={allowReview}
              onChange={(e) => setAllowReview(e.target.checked)}
              className="h-4.5 w-4.5 accent-indigo-600 rounded cursor-pointer"
            />
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-2">
          <Button type="submit" variant="primary" icon={IoSave}>
            Save All Settings
          </Button>
        </div>
      </form>

      <Toast 
        message="Settings updated and saved successfully!" 
        type="success" 
        isVisible={toastVisible} 
        onClose={() => setToastVisible(false)} 
      />
    </div>
  );
};

export default LearnerSettings;
