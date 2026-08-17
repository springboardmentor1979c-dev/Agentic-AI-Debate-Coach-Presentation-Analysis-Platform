export const parseDebateResponse = (text) => {
  const sections = {};

  const headings = [
    "🤖 AI Opponent",
    "📊 Argument Evaluation",
    "✅ Strengths",
    "⚠ Weaknesses",
    "❌ Logical Fallacies",
    "📚 Missing Evidence",
    "💡 Suggestions to Improve",
    "✍ Improved Version of Your Argument",
    "📖 Evidence You Can Use",
    "🔥 Possible Counterarguments"
  ];

  let current = "";

  text.split("\n").forEach((line) => {
    const heading = headings.find((h) => line.includes(h));

    if (heading) {
      current = heading;
      sections[current] = "";
    } else if (current) {
      sections[current] += line + "\n";
    }
  });

  return sections;
};