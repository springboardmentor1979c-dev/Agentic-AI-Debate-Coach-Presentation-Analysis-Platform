import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const NewDebate = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    topic: "",
    stance: "For",
    mode: "Text",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const createDebate = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.post(
    "/debate/create",
    {},
    {
        params: form,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    }
);

      navigate("/learner/debate-room", {
  state: {
    debateId: response.data.session.id,
    topic: response.data.session.topic,
    stance: response.data.session.stance,
    mode: response.data.session.mode,
  },
});

    } catch (err) {
      console.error(err);
      alert("Unable to create debate.");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-6">
      <h1 className="text-3xl font-bold">
        Start New AI Debate
      </h1>

      <input
        className="border p-3 w-full rounded"
        placeholder="Debate Topic"
        name="topic"
        value={form.topic}
        onChange={handleChange}
      />

      <select
        className="border p-3 w-full rounded"
        name="stance"
        value={form.stance}
        onChange={handleChange}
      >
        <option>For</option>
        <option>Against</option>
      </select>

      <select
        className="border p-3 w-full rounded"
        name="mode"
        value={form.mode}
        onChange={handleChange}
      >
        <option>Text</option>
        <option>Voice</option>
      </select>

      <button
        onClick={createDebate}
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg"
      >
        Start Debate
      </button>
    </div>
  );
};

export default NewDebate;