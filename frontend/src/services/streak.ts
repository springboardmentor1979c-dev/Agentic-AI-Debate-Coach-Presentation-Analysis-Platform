const STREAK_KEY = "oratio_streak";
const LAST_PRACTICE_KEY = "oratio_last_practice";

type StreakData = {
  current: number;
  longest: number;
};

const getToday = () => {
  return new Date().toISOString().split("T")[0];
};

export const recordPractice = (): StreakData => {
  const today = getToday();

  const lastPractice = localStorage.getItem(LAST_PRACTICE_KEY);

  const saved = localStorage.getItem(STREAK_KEY);

  const streak: StreakData = saved
    ? JSON.parse(saved)
    : { current: 0, longest: 0 };

  if (lastPractice === today) {
    return streak;
  }

  if (lastPractice) {
    const lastDate = new Date(lastPractice);
    const todayDate = new Date(today);

    const difference =
      Math.floor(
        (todayDate.getTime() - lastDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );

    if (difference === 1) {
      streak.current += 1;
    } else {
      streak.current = 1;
    }
  } else {
    streak.current = 1;
  }

  if (streak.current > streak.longest) {
    streak.longest = streak.current;
  }

  localStorage.setItem(
    STREAK_KEY,
    JSON.stringify(streak)
  );

  localStorage.setItem(
    LAST_PRACTICE_KEY,
    today
  );

  return streak;
};

export const getStreak = (): StreakData => {
  const saved = localStorage.getItem(STREAK_KEY);

  if (!saved) {
    return {
      current: 0,
      longest: 0,
    };
  }

  return JSON.parse(saved);
};