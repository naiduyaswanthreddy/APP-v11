import React from 'react';

const Coding = () => {
  const codingStats = [
    { platform: 'LeetCode', solved: 150, rank: '50k' },
    { platform: 'HackerRank', solved: 200, rank: '25k' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Coding Progress</h2>
      <div className="grid gap-4">
        {codingStats.map((stat, idx) => (
          <div key={idx} className="p-6 bg-white rounded-lg shadow-sm">
            <h3 className="font-semibold text-lg mb-2">{stat.platform}</h3>
            <div className="space-y-2">
              <p className="text-gray-600">Problems Solved: {stat.solved}</p>
              <p className="text-gray-600">Current Rank: {stat.rank}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Coding;