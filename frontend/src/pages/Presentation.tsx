import { useState, type ChangeEvent } from "react";
import api from "../services/api";
import { jsPDF } from "jspdf";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import {
  Upload,
  Mic,
  Square,
  RotateCcw,
  FileText,
  Play,
  Download,
  CheckCircle2,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../hooks/useTheme";

type ScoreKey =
  | "overall"
  | "confidence"
  | "clarity"
  | "grammar"
  | "structure"
  | "pace"
  | "engagement"
  | "content";

export default function Presentation() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");

  const {
    transcript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  if (!browserSupportsSpeechRecognition) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center px-6 ${
          dark
            ? "bg-[#020817] text-white"
            : "bg-slate-50 text-slate-900"
        }`}
      >
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold">
            Speech recognition is unavailable
          </h1>

          <p className="text-slate-500 mt-3">
            Please use a supported browser such as Microsoft Edge.
          </p>
        </div>
      </div>
    );
  }

  const wordCount = transcript
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const fillerTerms = [
    "um",
    "uh",
    "like",
    "actually",
    "basically",
  ];

  const transcriptWords = transcript
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const fillerCount = transcriptWords.filter((word: string) =>
    fillerTerms.includes(
      word.replace(/[.,!?;:]/g, "")
    )
  ).length;

  const extractScore = (
    label: string,
    text: string
  ): number | null => {
    const regex = new RegExp(
      `${label}[\\s\\S]{0,40}?(\\d{1,3})\\s*/\\s*100`,
      "i"
    );

    const match = text.match(regex);

    if (!match) return null;

    const value = Number(match[1]);

    if (value < 0 || value > 100) return null;

    return value;
  };

  const getScore = (key: ScoreKey): number | null => {
    const labels: Record<ScoreKey, string> = {
      overall: "OVERALL SCORE",
      confidence: "CONFIDENCE SCORE",
      clarity: "CLARITY SCORE",
      grammar: "GRAMMAR SCORE",
      structure: "PRESENTATION STRUCTURE",
      pace: "SPEAKING PACE",
      engagement: "AUDIENCE ENGAGEMENT",
      content: "CONTENT QUALITY",
    };

    return extractScore(labels[key], feedback);
  };

  const overallScore = getScore("overall");
  const confidenceScore = getScore("confidence");
  const clarityScore = getScore("clarity");
  const grammarScore = getScore("grammar");
  const structureScore = getScore("structure");
  const paceScore = getScore("pace");
  const engagementScore = getScore("engagement");
  const contentScore = getScore("content");

  const getFillerWordsFromAI = () => {
    const match = feedback.match(
      /FILLER WORD USAGE\s*\n\s*(Low|Medium|High)/i
    );

    return match ? match[1] : "Not available";
  };

  const extractSection = (
    heading: string,
    nextHeading: string
  ) => {
    if (!feedback) return "";

    const regex = new RegExp(
      `${heading}[\\s\\S]*?(?=${nextHeading}|$)`,
      "i"
    );

    const match = feedback.match(regex);

    if (!match) return "";

    return match[0]
      .replace(new RegExp(`^${heading}\\s*`, "i"), "")
      .trim();
  };

  const strengths = extractSection(
    "STRENGTHS",
    "AREAS FOR IMPROVEMENT"
  );

  const improvements = extractSection(
    "AREAS FOR IMPROVEMENT",
    "RECOMMENDATIONS"
  );

  const recommendations = extractSection(
    "RECOMMENDATIONS",
    "CONTENT COVERAGE"
  );

  const contentCoverage = extractSection(
    "CONTENT COVERAGE",
    "OVERALL SUMMARY"
  );

  const overallSummary =
    feedback.split(/OVERALL SUMMARY/i)[1]?.trim() || "";

  const analyzePresentation = async () => {
    if (!file && transcript.trim() === "") {
      alert("Upload a presentation or record your speech first.");
      return;
    }

    const formData = new FormData();

    if (file) {
      formData.append("file", file);
    }

    formData.append("transcript", transcript);

    setLoading(true);

    try {
      const res = await api.post(
        "/presentation/analyze",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setFeedback(res.data.feedback);
    } catch (err) {
      alert("Presentation analysis failed.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!feedback) {
      alert("No report available.");
      return;
    }

    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const textWidth = pageWidth - margin * 2;

    doc.setFillColor(2, 8, 23);
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("ORATIO AI", margin, 17);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Presentation Evaluation Report",
      margin,
      27
    );

    let y = 55;

    doc.setTextColor(30, 41, 59);

    if (file) {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Presentation", margin, y);

      y += 7;

      doc.setFont("helvetica", "normal");
      doc.text(file.name, margin, y);

      y += 14;
    }

    if (overallScore !== null) {
      doc.setFont("helvetica", "bold");
      doc.text(
        `Overall Score: ${overallScore}/100`,
        margin,
        y
      );

      y += 12;
    }

    const scoreLines = [
      confidenceScore !== null
        ? `Confidence: ${confidenceScore}/100`
        : "",
      clarityScore !== null
        ? `Clarity: ${clarityScore}/100`
        : "",
      grammarScore !== null
        ? `Grammar: ${grammarScore}/100`
        : "",
      structureScore !== null
        ? `Presentation Structure: ${structureScore}/100`
        : "",
      paceScore !== null
        ? `Speaking Pace: ${paceScore}/100`
        : "",
      engagementScore !== null
        ? `Audience Engagement: ${engagementScore}/100`
        : "",
      contentScore !== null
        ? `Content Quality: ${contentScore}/100`
        : "",
      `Words Spoken: ${wordCount}`,
      `Filler Words Detected: ${fillerCount}`,
    ].filter(Boolean);

    doc.setFont("helvetica", "normal");

    scoreLines.forEach((line) => {
      doc.text(line, margin, y);
      y += 6;
    });

    y += 8;

    doc.setFont("helvetica", "bold");
    doc.text("Detailed Evaluation", margin, y);

    y += 8;

    doc.setFont("helvetica", "normal");

    const lines = doc.splitTextToSize(
      feedback,
      textWidth
    );

    for (const line of lines) {
      if (y > 275) {
        doc.addPage();
        y = 20;
      }

      doc.text(line, margin, y);
      y += 6;
    }

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.text(
      "Generated by Oratio AI",
      margin,
      290
    );

    doc.save("Oratio_AI_Presentation_Report.pdf");
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile =
      event.target.files?.[0] || null;

    setFile(selectedFile);
  };

  const renderScoreCard = (
    label: string,
    score: number | null
  ) => {
    return (
      <div
        className={`rounded-2xl border p-5 ${
          dark
            ? "border-slate-800 bg-slate-950/70"
            : "border-slate-200 bg-white"
        }`}
      >
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
          {label}
        </p>

        <div className="mt-3 flex items-end justify-between gap-4">
          <p
            className={`text-3xl font-semibold ${
              dark ? "text-white" : "text-slate-900"
            }`}
          >
            {score !== null ? score : "—"}
          </p>

          {score !== null && (
            <p className="text-sm text-slate-500">
              / 100
            </p>
          )}
        </div>

        <div className="mt-4 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-400 transition-all duration-700"
            style={{
              width: `${score ?? 0}%`,
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        dark
          ? "bg-[#020817] text-white"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Header */}
      <header
        className={`border-b backdrop-blur-xl ${
          dark
            ? "border-slate-800/80 bg-[#020817]/90"
            : "border-slate-200 bg-white/90"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-5">
          <div className="flex items-center justify-between gap-4">

            <div>
              <h1
                className={`text-2xl font-semibold tracking-wide ${
                  dark ? "text-white" : "text-slate-900"
                }`}
              >
                ORATIO AI
              </h1>

              <p className="text-xs text-slate-500 mt-1 tracking-[0.2em] uppercase">
                Communication Intelligence
              </p>
            </div>

            <div className="flex items-center gap-3">

              <span className="hidden sm:block text-sm text-slate-500">
                Presentation Evaluation
              </span>

              <button
                onClick={toggleTheme}
                aria-label="Toggle theme"
                className={`inline-flex items-center justify-center h-10 w-10 rounded-xl border transition-all ${
                  dark
                    ? "border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:border-slate-500"
                    : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                {dark ? (
                  <Sun size={17} />
                ) : (
                  <Moon size={17} />
                )}
              </button>

            </div>

          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-10 py-12">

        {/* Intro */}
        <section className="max-w-3xl mb-10">

          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/5 px-3 py-1.5 text-xs text-indigo-500">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            Presentation Analysis
          </div>

          <h2
            className={`mt-5 text-4xl md:text-5xl font-semibold tracking-tight ${
              dark ? "text-white" : "text-slate-900"
            }`}
          >
            Evaluate your presentation
            <span className="block text-slate-500">
              with structured AI feedback.
            </span>
          </h2>

          <p
            className={`mt-5 leading-7 max-w-2xl ${
              dark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            Upload your presentation, record your delivery,
            or combine both for a complete evaluation.
          </p>

        </section>

        {/* Input Cards */}
        <section className="grid lg:grid-cols-2 gap-6">

          {/* Upload */}
          <div
            className={`rounded-3xl border backdrop-blur-xl p-7 ${
              dark
                ? "border-slate-800 bg-slate-900/60"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-start gap-4">

              <div className="h-11 w-11 rounded-xl border border-blue-500/20 bg-blue-500/10 flex items-center justify-center">
                <Upload
                  size={20}
                  className="text-blue-500"
                />
              </div>

              <div>
                <h3
                  className={`text-lg font-semibold ${
                    dark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Presentation file
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Upload a PDF, PowerPoint, or text file.
                </p>
              </div>
            </div>

            <label className="mt-7 block cursor-pointer">

              <div
                className={`rounded-2xl border border-dashed p-8 text-center transition-all ${
                  dark
                    ? "border-slate-700 bg-slate-950/50 hover:border-indigo-400/50 hover:bg-indigo-400/5"
                    : "border-slate-300 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50"
                }`}
              >
                <FileText
                  size={28}
                  className="mx-auto text-slate-500"
                />

                <p className="mt-4 text-sm font-medium text-slate-500">
                  Choose a presentation
                </p>

                <p className="mt-2 text-xs text-slate-400">
                  PDF, PPTX, or TXT
                </p>

                <span
                  className={`mt-5 inline-flex items-center justify-center rounded-xl border px-4 py-2 text-sm ${
                    dark
                      ? "border-slate-700 bg-slate-900 text-slate-300"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  Browse Files
                </span>
              </div>

              <input
                type="file"
                accept=".pdf,.pptx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {file && (
              <div className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">

                <CheckCircle2
                  size={18}
                  className="text-emerald-500 shrink-0"
                />

                <div className="min-w-0">

                  <p className="text-sm text-emerald-500">
                    File selected
                  </p>

                  <p className="text-xs text-slate-500 truncate mt-1">
                    {file.name}
                  </p>

                </div>

              </div>
            )}

          </div>

          {/* Recording */}
          <div
            className={`rounded-3xl border backdrop-blur-xl p-7 ${
              dark
                ? "border-slate-800 bg-slate-900/60"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-start gap-4">

              <div className="h-11 w-11 rounded-xl border border-violet-500/20 bg-violet-500/10 flex items-center justify-center">
                <Mic
                  size={20}
                  className="text-violet-500"
                />
              </div>

              <div>
                <h3
                  className={`text-lg font-semibold ${
                    dark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Speech recording
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Record your presentation delivery.
                </p>
              </div>

            </div>

            <div className="mt-7 flex flex-wrap gap-3">

              <button
                onClick={() =>
                  SpeechRecognition.startListening({
                    continuous: true,
                  })
                }
                disabled={listening}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-400 disabled:text-slate-600 px-4 py-3 text-sm font-medium transition-all"
              >
                <Mic size={17} />
                Start Recording
              </button>

              <button
                onClick={() =>
                  SpeechRecognition.stopListening()
                }
                disabled={!listening}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  dark
                    ? "border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800 disabled:opacity-40"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                }`}
              >
                <Square size={16} />
                Stop
              </button>

              <button
                onClick={resetTranscript}
                className={`inline-flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                  dark
                    ? "border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                <RotateCcw size={16} />
                Clear
              </button>

            </div>

            <div className="mt-5 flex items-center gap-2 text-sm">

              <span
                className={`h-2 w-2 rounded-full ${
                  listening
                    ? "bg-red-400 animate-pulse"
                    : "bg-slate-500"
                }`}
              />

              <span className="text-slate-500">
                {listening
                  ? "Recording in progress"
                  : "Ready to record"}
              </span>

            </div>

            <textarea
              className={`w-full mt-5 min-h-44 resize-none rounded-2xl border px-4 py-4 text-sm leading-6 outline-none transition-all ${
                dark
                  ? "border-slate-800 bg-slate-950/80 text-slate-300 placeholder:text-slate-600 focus:border-indigo-400/50"
                  : "border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-400 focus:border-indigo-300"
              }`}
              value={transcript}
              readOnly
              placeholder="Your spoken transcript will appear here."
            />

            {/* Speech Metrics */}
            <div className="grid grid-cols-2 gap-4 mt-4">

              <div
                className={`rounded-2xl border p-4 ${
                  dark
                    ? "border-slate-800 bg-slate-950/70"
                    : "border-slate-200 bg-white"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                  Words Spoken
                </p>

                <p
                  className={`mt-2 text-2xl font-semibold ${
                    dark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {wordCount}
                </p>
              </div>

              <div
                className={`rounded-2xl border p-4 ${
                  dark
                    ? "border-slate-800 bg-slate-950/70"
                    : "border-slate-200 bg-white"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                  Filler Words
                </p>

                <p
                  className={`mt-2 text-2xl font-semibold ${
                    dark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {fillerCount}
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* Generate */}
        <section
          className={`mt-6 rounded-3xl border p-7 ${
            dark
              ? "border-slate-800 bg-slate-900/70"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>
              <h3
                className={`text-lg font-semibold ${
                  dark ? "text-white" : "text-slate-900"
                }`}
              >
                Generate evaluation
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Analyze presentation content and recorded delivery.
              </p>
            </div>

            <button
              onClick={analyzePresentation}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-400 disabled:text-slate-600 px-6 py-3 text-sm font-medium transition-all shadow-lg shadow-indigo-950/20"
            >
              {loading ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Generating...
                </>
              ) : (
                <>
                  <Play size={17} />
                  Generate Analysis
                </>
              )}
            </button>

          </div>
        </section>

        {/* Results */}
        {feedback && (
          <section className="mt-6">

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">

              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-indigo-500">
                  Evaluation Report
                </p>

                <h3
                  className={`mt-2 text-3xl font-semibold ${
                    dark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Presentation Performance
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  A structured assessment of your presentation and delivery.
                </p>
              </div>

              <button
                onClick={downloadReport}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-medium transition-all ${
                  dark
                    ? "border-slate-700 bg-slate-950 text-slate-300 hover:border-indigo-400/40 hover:bg-slate-900"
                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-slate-50"
                }`}
              >
                <Download size={17} />
                Download PDF Report
              </button>

            </div>

            {/* Score Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {renderScoreCard("Overall Score", overallScore)}
              {renderScoreCard("Confidence", confidenceScore)}
              {renderScoreCard("Clarity", clarityScore)}
              {renderScoreCard("Grammar", grammarScore)}
              {renderScoreCard("Structure", structureScore)}
              {renderScoreCard("Speaking Pace", paceScore)}
              {renderScoreCard("Engagement", engagementScore)}
              {renderScoreCard("Content Quality", contentScore)}
            </div>

            {/* Delivery + Summary */}
            <div className="mt-6 grid lg:grid-cols-3 gap-6">

              <div
                className={`lg:col-span-2 rounded-3xl border p-7 ${
                  dark
                    ? "border-slate-800 bg-slate-900/60"
                    : "border-slate-200 bg-white"
                }`}
              >

                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                      Delivery Metric
                    </p>

                    <h4
                      className={`mt-2 text-xl font-semibold ${
                        dark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      Speech Performance
                    </h4>
                  </div>

                  <span
                    className={`rounded-full border px-3 py-1 text-sm ${
                      dark
                        ? "border-slate-700 bg-slate-950 text-slate-300"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    {getFillerWordsFromAI()}
                  </span>

                </div>

                <div className="grid sm:grid-cols-2 gap-4 mt-6">

                  <div
                    className={`rounded-2xl border p-5 ${
                      dark
                        ? "border-slate-800 bg-slate-950/70"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                      Words Spoken
                    </p>

                    <p
                      className={`mt-2 text-3xl font-semibold ${
                        dark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {wordCount}
                    </p>
                  </div>

                  <div
                    className={`rounded-2xl border p-5 ${
                      dark
                        ? "border-slate-800 bg-slate-950/70"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
                      Filler Words Detected
                    </p>

                    <p
                      className={`mt-2 text-3xl font-semibold ${
                        dark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {fillerCount}
                    </p>
                  </div>

                </div>

                <div
                  className={`mt-5 rounded-2xl border p-5 ${
                    dark
                      ? "border-slate-800 bg-slate-950/70"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <p
                    className={`text-sm leading-7 ${
                      dark ? "text-slate-400" : "text-slate-600"
                    }`}
                  >
                    {contentCoverage ||
                      "Content coverage information is not available."}
                  </p>
                </div>

              </div>

              <div
                className={`rounded-3xl border p-7 ${
                  dark
                    ? "border-slate-800 bg-slate-900/60"
                    : "border-slate-200 bg-white"
                }`}
              >

                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                  Overall Assessment
                </p>

                <h4
                  className={`mt-2 text-xl font-semibold ${
                    dark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Summary
                </h4>

                <p
                  className={`mt-5 text-sm leading-7 ${
                    dark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {overallSummary ||
                    "Summary is not available."}
                </p>

              </div>

            </div>

            {/* Strengths / Improvements / Recommendations */}
            <div className="mt-6 grid lg:grid-cols-3 gap-6">

              <div
                className={`rounded-3xl border p-7 ${
                  dark
                    ? "border-slate-800 bg-slate-900/60"
                    : "border-slate-200 bg-white"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.16em] text-emerald-500">
                  Strengths
                </p>

                <pre
                  className={`mt-5 whitespace-pre-wrap font-sans text-sm leading-7 ${
                    dark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {strengths || "No strengths reported."}
                </pre>
              </div>

              <div
                className={`rounded-3xl border p-7 ${
                  dark
                    ? "border-slate-800 bg-slate-900/60"
                    : "border-slate-200 bg-white"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.16em] text-amber-500">
                  Areas for Improvement
                </p>

                <pre
                  className={`mt-5 whitespace-pre-wrap font-sans text-sm leading-7 ${
                    dark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {improvements ||
                    "No improvement areas reported."}
                </pre>
              </div>

              <div
                className={`rounded-3xl border p-7 ${
                  dark
                    ? "border-slate-800 bg-slate-900/60"
                    : "border-slate-200 bg-white"
                }`}
              >
                <p className="text-xs uppercase tracking-[0.16em] text-indigo-500">
                  Recommendations
                </p>

                <pre
                  className={`mt-5 whitespace-pre-wrap font-sans text-sm leading-7 ${
                    dark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {recommendations ||
                    "No recommendations reported."}
                </pre>
              </div>

            </div>

            {/* Full Evaluation */}
            <details
              className={`mt-6 rounded-3xl border p-7 ${
                dark
                  ? "border-slate-800 bg-slate-900/60"
                  : "border-slate-200 bg-white"
              }`}
            >
              <summary
                className={`cursor-pointer text-sm font-medium ${
                  dark ? "text-slate-300" : "text-slate-700"
                }`}
              >
                View full AI evaluation
              </summary>

              <pre
                className={`mt-5 whitespace-pre-wrap font-sans text-sm leading-7 ${
                  dark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                {feedback}
              </pre>
            </details>

          </section>
        )}

      </main>
    </div>
  );
}