import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "@/components/Layout";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function GradesPage() {
  const [students, setStudents] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentGrades, setStudentGrades] = useState([]);

  useEffect(() => {
    fetchGrades();
    fetchHeatmap();
  }, []);

  // 📊 Fetch all students + grades
  const fetchGrades = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/grades?classId=4"
    );

    setStudents(res.data.students);

    // Auto select first student
    if (res.data.students.length > 0) {
      const first = res.data.students[0];
      setSelectedStudent(first.id);
      fetchStudentGrades(first.id);
    }
  };

  // 🔥 Fetch heatmap
  const fetchHeatmap = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/grades/heatmap?classId=4"
    );

    setHeatmap(res.data.heatmap);
  };

  // 📈 Fetch student trend
  const fetchStudentGrades = async (id) => {
    const res = await axios.get(
      `http://localhost:5000/api/grades/student/${id}`
    );

    setStudentGrades(res.data.grades);
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">

        <h1 className="text-2xl font-bold text-[#1A1A2E]">
          Grades & Performance
        </h1>

        {/* 🎯 Student Selector */}
        <div className="bg-white p-4 rounded shadow">
          <label className="block mb-2 font-medium">Select Student</label>

          <select
            className="border p-2 rounded w-full"
            onChange={(e) => {
              setSelectedStudent(e.target.value);
              fetchStudentGrades(e.target.value);
            }}
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* 📈 Line Chart */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-4">Grade Trend</h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={studentGrades}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="topic" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="marks" stroke="#7C3AED" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 🔥 Heatmap */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-4">Learning Gap Heatmap</h2>

          <div className="space-y-4">
            {heatmap.map((subject, i) => (
              <div key={i}>
                <h3 className="font-bold mb-2">{subject.subject}</h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {subject.topics.map((t, j) => {
                    let color = "bg-green-400";

                    if (t.category === "weak") color = "bg-red-500";
                    else if (t.category === "average")
                      color = "bg-yellow-400";

                    return (
                      <div
                        key={j}
                        className={`p-3 text-white rounded ${color}`}
                      >
                        <p className="text-sm font-semibold">{t.topic}</p>
                        <p>{t.average}%</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Layout>
  );
}