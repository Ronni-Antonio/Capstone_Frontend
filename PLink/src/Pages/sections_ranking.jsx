import React from 'react';

const sections = [
  {
    rank: 1,
    name: '3-Sampaguita',
    points: 2060,
    bottles: 412,
    students: 48,
    growth: '+12%',
    badge: 'Eco Champion',
    width: '100%',
  },
  {
    rank: 2,
    name: '3-Rosal',
    points: 1880,
    bottles: 376,
    students: 46,
    growth: '+8%',
    badge: 'Rising Star',
    width: '90%',
  },
  {
    rank: 3,
    name: '3-Orchid',
    points: 1490,
    bottles: 298,
    students: 44,
    growth: '+5%',
    badge: 'Green Warriors',
    width: '72%',
  },
  {
    rank: 4,
    name: '3-Jasmine',
    points: 1255,
    bottles: 251,
    students: 45,
    growth: '-2%',
    badge: 'Steady Recyclers',
    width: '60%',
  },
  {
    rank: 5,
    name: '3-Ilang-ilang',
    points: 945,
    bottles: 189,
    students: 41,
    growth: '+15%',
    badge: 'On the Rise',
    width: '45%',
  },
];

export default function SectionsRanking() {
  return (
    <div className="space-y-6">

      {/* Top Winner Card */}
      <div className="bg-[#3e5f44] rounded-3xl p-8 text-white flex justify-between items-center">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-[#6c8b67] flex items-center justify-center">
            <i className="fa-solid fa-trophy text-2xl"></i>
          </div>

          <div>
            <p className="text-xs opacity-80">
              Top Eco Section
            </p>

            <h2 className="text-5xl font-bold">
              3-Sampaguita
            </h2>

            <p className="mt-2 text-[#d9eac9]">
              Leading with 2,060 points · 412 bottles recycled
            </p>
          </div>
        </div>

        <div className="flex gap-12">
          <div>
            <div className="text-xs opacity-70">
              Students
            </div>

            <div className="text-4xl font-bold">
              48
            </div>
          </div>

          <div>
            <div className="text-xs opacity-70">
              Growth
            </div>

            <div className="text-4xl font-bold text-[#d8f0c1]">
              +12%
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Podium */}
      <div className="bg-white rounded-3xl p-8 border border-[#dbe6db] shadow-sm">

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-[#3e5f44]">
            Leaderboard
          </h3>

          <div className="flex bg-[#f3f6ee] rounded-xl p-1">
            <button className="px-5 py-2 rounded-lg bg-[#3e5f44] text-white text-sm font-semibold">
              Weekly
            </button>

            <button className="px-5 py-2 text-sm text-[#6f876f]">
              Monthly
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 items-end h-52">

          <div className="text-center">
            <div className="text-xl font-bold text-[#3e5f44]">
              3-Rosal
            </div>

            <div className="text-sm text-[#7a947e] mb-3">
              1,880 pts
            </div>

            <div className="h-20 bg-[#88b07b] rounded-t-2xl flex items-center justify-center text-white text-3xl font-bold">
              2
            </div>
          </div>

          <div className="text-center">
            <div className="text-xl font-bold text-[#3e5f44]">
              3-Sampaguita
            </div>

            <div className="text-sm text-[#7a947e] mb-3">
              2,060 pts
            </div>

            <div className="h-28 bg-[#3e5f44] rounded-t-2xl flex items-center justify-center text-white text-3xl font-bold">
              1
            </div>
          </div>

          <div className="text-center">
            <div className="text-xl font-bold text-[#3e5f44]">
              3-Orchid
            </div>

            <div className="text-sm text-[#7a947e] mb-3">
              1,490 pts
            </div>

            <div className="h-16 bg-[#9bc183] rounded-t-2xl flex items-center justify-center text-white text-3xl font-bold">
              3
            </div>
          </div>

        </div>
      </div>

      {/* Full Rankings */}
      <div className="bg-white rounded-3xl border border-[#dbe6db] overflow-hidden shadow-sm">

        <div className="p-6 border-b border-[#edf2ea]">
          <h3 className="text-xl font-bold text-[#3e5f44]">
            Full Rankings · This Week
          </h3>
        </div>

        {sections.map((section) => (
          <div
            key={section.rank}
            className="p-6 border-b border-[#edf2ea] last:border-b-0"
          >
            <div className="flex justify-between">

              <div className="flex gap-4 flex-1">

                <div className="w-12 h-12 rounded-2xl bg-[#8cb07e] text-white font-bold flex items-center justify-center">
                  {section.rank}
                </div>

                <div className="flex-1">

                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-[#3e5f44]">
                      {section.name}
                    </h4>

                    <span className="bg-[#e8f5bd] text-[#3e5f44] text-xs px-2 py-1 rounded-full">
                      {section.badge}
                    </span>
                  </div>

                  <p className="text-sm text-[#7a947e]">
                    {section.students} students · {section.bottles} bottles recycled
                  </p>

                  <div className="w-full h-2 bg-[#edf2ea] rounded-full mt-3">
                    <div
                      className="h-2 bg-[#7faa72] rounded-full"
                      style={{ width: section.width }}
                    />
                  </div>

                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-[#3e5f44]">
                  {section.points.toLocaleString()}
                </div>

                <div className="text-sm text-[#7a947e]">
                  points
                </div>

                <div
                  className={`text-sm font-semibold ${
                    section.growth.startsWith('-')
                      ? 'text-red-500'
                      : 'text-green-600'
                  }`}
                >
                  {section.growth}
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}