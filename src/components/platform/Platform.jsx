import React, { useState } from "react";
import { leetcodeService } from "../../services/platform/platform";

const Platform = () => {
  const [showAddScreen, setShowAddScreen] = useState(false);
  const [platform, setPlatform] = useState("leetcode");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ DEFAULT DATA (Codeforces)
  const [platformData, setPlatformData] = useState({
    platform: "codeforces",
    username: "SHUSHANT625",
    titlePhoto: "https://userpic.codeforces.org/4435853/title/fe56b138a787adb6.jpg",
    easy: 0,
    medium: 0,
    hard: 0,
    rating: 360,
    rank: "newbie",
  });

  const normalizeData = (platform, data) => {
    if (platform === "leetcode") {
      return {
        platform: "leetcode",
        username,
        titlePhoto: null,
        easy: data.Easy || 0,
        medium: data.Medium || 0,
        hard: data.Hard || 0,
      };
    }

    if (platform === "codeforces") {
      return {
        platform: "codeforces",
        username: data.handle || username,
        titlePhoto: data.titlePhoto,
        easy: 0,
        medium: 0,
        hard: 0,
        rating: data.rating,
        rank: data.rank,
      };
    }

    return null;
  };

  const handleSubmit = async () => {
    if (!username) return;

    try {
      setLoading(true);
      let response;

      if (platform === "leetcode") {
        response = await leetcodeService(username);
      }

      if (platform === "codeforces") {
        // 🔹 REAL DATA STRUCTURE (same as you gave)
        response = {
          data: {
            handle: username,
            titlePhoto:
              "https://userpic.codeforces.org/4435853/avatar/c2246234e11c3382.jpg",
            rating: 360,
            rank: "newbie",
          },
        };
      }

      const normalized = normalizeData(platform, response.data);
      setPlatformData(normalized);

      setShowAddScreen(false);
      setUsername("");
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow min-h-[260px]">

      {/* ================= NORMAL VIEW ================= */}
      {!showAddScreen && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Coding Platform
            </h2>

            <button
              onClick={() => setShowAddScreen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full
                         bg-yellow-400 text-black text-xl font-bold hover:bg-yellow-300"
            >
              +
            </button>
          </div>

          {/* ===== PLATFORM DATA ALWAYS VISIBLE ===== */}
          <div className="flex items-center gap-4">
            {platformData.titlePhoto && (
              <img
                src={platformData.titlePhoto}
                alt="avatar"
                className="w-14 h-14 rounded-full border"
              />
            )}

            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 uppercase">
                {platformData.platform}
              </p>

              <p className="text-lg font-semibold text-gray-800 dark:text-white">
                {platformData.username}
              </p>

              {platformData.platform === "codeforces" && (
                <p className="text-sm text-gray-400">
                  Rating: {platformData.rating} ({platformData.rank})
                </p>
              )}
            </div>
          </div>

          {/* Difficulty (default bhi dikhega) */}
          <div className="flex gap-6 mt-4">
            <span className="text-green-500">
              Easy: {platformData.easy}
            </span>
            <span className="text-yellow-500">
              Medium: {platformData.medium}
            </span>
            <span className="text-red-500">
              Hard: {platformData.hard}
            </span>
          </div>
        </>
      )}

      {/* ================= ADD PLATFORM VIEW ================= */}
      {showAddScreen && (
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Add Platform
            </h3>

            <button
              onClick={() => setShowAddScreen(false)}
              className="text-gray-500 hover:text-gray-800 dark:hover:text-white"
            >
              ✕
            </button>
          </div>

          <label className="text-sm mb-1 text-gray-600 dark:text-gray-300">
            Platform
          </label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="mb-4 p-2 rounded border dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="leetcode">LeetCode</option>
            <option value="codeforces">Codeforces</option>
          </select>

          <label className="text-sm mb-1 text-gray-600 dark:text-gray-300">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="mb-6 p-2 rounded border dark:bg-gray-800 dark:border-gray-700"
          />

          <div className="mt-auto flex gap-3">
            <button
              onClick={() => setShowAddScreen(false)}
              className="flex-1 py-2 rounded bg-gray-200 dark:bg-gray-700"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-2 rounded bg-yellow-400 text-black
                         hover:bg-yellow-300 disabled:opacity-60"
            >
              {loading ? "Fetching..." : "Add"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Platform;
