import { useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { TrophyIcon } from 'lucide-react';

const badges = ['Eco Champion', 'Rising Star', 'Green Warriors', 'Steady Recyclers', 'On the Rise'];

export default function SectionsRanking() {
  const { students, transactions, sectionsRanking, refreshSectionsRanking } = useData();

  useEffect(() => {
    refreshSectionsRanking().catch((error) => console.error('Unable to load section ranking:', error));
  }, [refreshSectionsRanking]);
  
  // Calculate ranking from students/transactions if API ranking is empty
  const sectionsData = useMemo(() => {


    if (sectionsRanking && Array.isArray(sectionsRanking) && sectionsRanking.length > 0) {
      // Add any missing properties to API data for consistency
      return sectionsRanking.map((section, index) => ({
        name: section.name || section.section_name || 'Unknown Section',
        students: section.students || 0,
        bottles: section.bottles || 0,
        points: section.points || 0,
        rank: section.rank || index + 1,
        growth: section.growth || '+0%',
        badge: section.badge || badges[index % badges.length],
        width: section.width || '100%',
        ...section,
      }));
    }

    // Make sure students is array
    const safeStudents = Array.isArray(students) ? students : [];
    const safeTransactions = Array.isArray(transactions) ? transactions : [];

    // Group students by section
    const sectionsMap = {};
    safeStudents.forEach(student => {
      const sectionName = (student.section || 'Unknown Section').toString();
      if (!sectionsMap[sectionName]) {
        sectionsMap[sectionName] = {
          name: sectionName,
          students: 0,
          bottles: 0,
          points: 0,
        };
      }
      sectionsMap[sectionName].students++;
    });

    // Get point conversion rate from settings
      // Add bottles and points from transactions
    safeTransactions.forEach(tx => {
      if (!tx) return;
      const studentId = tx.student_id;
      const student = safeStudents.find(s => (s.id || s.student_id) === studentId);
      if (student && student.section) {
        const sectionName = student.section.toString();
        if (sectionsMap[sectionName]) {
          const bottles = tx.bottles_deposited || tx.bottles || tx.bottle_qty || tx.bottles_qty || 0;
          sectionsMap[sectionName].bottles += Number(bottles) || 0;
          sectionsMap[sectionName].points += Number(tx.total_points || tx.points_earned || 0);
        }
      }
    });

    // Convert to array, sort, and add rank, growth, badge, width
    const sortedSections = Object.values(sectionsMap)
      .sort((a, b) => (b.points || 0) - (a.points || 0))
      .map((section, index) => ({
        ...section,
        rank: index + 1,
        growth: '+0%',
        badge: badges[index % badges.length],
        width: `${100 - (index * 15)}%`,
      }));

      
    return sortedSections;
  }, [students, transactions, sectionsRanking]);

  const topSection = sectionsData && sectionsData[0];
  const podiumSections = sectionsData ? sectionsData.slice(0, 3) : [];

  return (
    <div className="space-y-6">

      {/* Top Winner Card */}
      {topSection && (
        <div className="bg-[#3e5f44] rounded-3xl p-8 text-white flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-[#EBF5E4] border-2 border-[#A2CB8B] flex items-center justify-center">
              <TrophyIcon className="w-7 h-7 text-[#2F5D3A]" />
            </div>

            <div>
              <p className="text-xs opacity-80">
                Top Eco Section
              </p>

              <h2 className="text-5xl font-bold">
                {topSection.name}
              </h2>

              <p className="mt-2 text-[#d9eac9]">
                Leading with {topSection.points.toLocaleString()} points · {topSection.bottles.toLocaleString()} bottles recycled
              </p>
            </div>
          </div>

          <div className="flex gap-12">
            <div>
              <div className="text-xs opacity-70">
                Students
              </div>

              <div className="text-4xl font-bold">
                {topSection.students}
              </div>
            </div>

            <div>
              <div className="text-xs opacity-70">
                Growth
              </div>

              <div className="text-4xl font-bold text-[#d8f0c1]">
                {topSection.growth}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Podium */}
      {podiumSections.length > 0 && (
        <div className="bg-white rounded-3xl p-8 border border-[#dbe6db] shadow-sm">

          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-[#3e5f44]">
              Leaderboard
            </h3>

            <div className="flex bg-[#f3f6ee] rounded-xl p-1">
              <button className="px-5 py-2 rounded-xl bg-[#3e5f44] text-white text-sm font-semibold">
                Weekly
              </button>

              <button className="px-5 py-2 text-sm text-[#6f876f]">
                Monthly
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8 items-end h-52">
            {podiumSections.length > 1 && (
              <div className="text-center">
                <div className="text-xl font-bold text-[#3e5f44]">
                  {podiumSections[1].name}
                </div>

                <div className="text-sm text-[#7a947e] mb-3">
                  {podiumSections[1].points.toLocaleString()} pts
                </div>

                <div className="h-20 bg-[#88b07b] rounded-t-2xl flex items-center justify-center text-white text-3xl font-bold">
                  2
                </div>
              </div>
            )}

            {podiumSections.length > 0 && (
              <div className="text-center">
                <div className="text-xl font-bold text-[#3e5f44]">
                  {podiumSections[0].name}
                </div>

                <div className="text-sm text-[#7a947e] mb-3">
                  {podiumSections[0].points.toLocaleString()} pts
                </div>

                <div className="h-28 bg-[#3e5f44] rounded-t-2xl flex items-center justify-center text-white text-3xl font-bold">
                  1
                </div>
              </div>
            )}

            {podiumSections.length > 2 && (
              <div className="text-center">
                <div className="text-xl font-bold text-[#3e5f44]">
                  {podiumSections[2].name}
                </div>

                <div className="text-sm text-[#7a947e] mb-3">
                  {podiumSections[2].points.toLocaleString()} pts
                </div>

                <div className="h-16 bg-[#9bc183] rounded-t-2xl flex items-center justify-center text-white text-3xl font-bold">
                  3
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Rankings */}
      <div className="bg-white rounded-3xl border border-[#dbe6db] overflow-hidden shadow-sm">

        <div className="p-6 border-b border-[#edf2ea]">
          <h3 className="text-xl font-bold text-[#3e5f44]">
            Full Rankings · This Week
          </h3>
        </div>

        {sectionsData.map((section) => (
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

                    {section.badge && (
                      <span className="bg-[#e8f5bd] text-[#3e5f44] text-xs px-2 py-1 rounded-full">
                        {section.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-[#7a947e]">
                    {section.students} students · {section.bottles} bottles recycled
                  </p>

                  {section.width && (
                    <div className="w-full h-2 bg-[#edf2ea] rounded-full mt-3">
                      <div
                        className="h-2 bg-[#7faa72] rounded-full"
                        style={{ width: section.width }}
                      />
                    </div>
                  )}

                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-[#3e5f44]">
                  {section.points.toLocaleString()}
                </div>

                <div className="text-sm text-[#7a947e]">
                  points
                </div>

                {section.growth && (
                  <div
                    className={`text-sm font-semibold ${
                      section.growth.startsWith('-')
                        ? 'text-red-500'
                        : 'text-green-600'
                    }`}
                  >
                    {section.growth}
                  </div>
                )}
              </div>

            </div>
          </div>
        ))}

        {sectionsData.length === 0 && (
          <div className="p-8 text-center text-[#7a947e]">
            <p>No sections data available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
