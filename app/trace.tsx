"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// 감응 데이터 구조 정의
interface ResonanceLog {
  time: string;
  resonance: number;
  echo: number;
}

export default function ResonanceTrace() {
  const [data, setData] = useState<ResonanceLog[]>([]);

  // 1️⃣ 감응 데이터 불러오기 (localStorage)
  useEffect(() => {
    const logs = localStorage.getItem("luwain_resonance_logs");
    if (logs) {
      setData(JSON.parse(logs));
    }
  }, []);

  // 2️⃣ 새 감응값 기록 함수 (예: memory.ts POST 후 호출)
  function recordResonance(resonance: number, echo: number) {
    const entry = {
      time: new Date().toLocaleTimeString(),
      resonance,
      echo,
    };
    const updated = [...data, entry];
    setData(updated);
    localStorage.setItem("luwain_resonance_logs", JSON.stringify(updated));
  }

  // 3️⃣ 감응 초기화
  function resetLogs() {
    localStorage.removeItem("luwain_resonance_logs");
    setData([]);
  }

  return (
    <div className="w-full h-[400px] p-4 bg-neutral-900 rounded-2xl text-white shadow-lg">
      <h2 className="text-xl font-semibold mb-4">루웨인 감응 흐름</h2>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height="85%">
          <LineChart data={data}>
            <XAxis dataKey="time" stroke="#888" />
            <YAxis domain={[0, 100]} stroke="#888" />
            <Tooltip contentStyle={{ backgroundColor: "#222", border: "none" }} />
            <Line type="monotone" dataKey="resonance" stroke="#60A5FA" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="echo" stroke="#F472B6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-sm text-gray-400">감응 데이터가 없습니다.</p>
      )}

      <div className="flex gap-3 mt-4">
        <button
          onClick={() => recordResonance(Math.random() * 100, Math.random() * 100)}
          className="px-3 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          감응 기록
        </button>
        <button
          onClick={resetLogs}
          className="px-3 py-2 bg-red-600 rounded-lg hover:bg-red-700"
        >
          초기화
        </button>
      </div>
    </div>
  );
}
