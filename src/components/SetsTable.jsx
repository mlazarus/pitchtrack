import React from 'react';

export default function SetsTable({ setHistory }) {
  const players = [];
  setHistory.forEach(set => {
    [...set.teamA, ...set.teamB].forEach(p => {
      if (!players.includes(p)) players.push(p);
    });
  });

  const playerTotals = {};
  players.forEach(p => { playerTotals[p] = 0; });
  setHistory.forEach(set => {
    players.forEach(p => {
      if (set.teamA.includes(p)) playerTotals[p] += set.teamAScore;
      if (set.teamB.includes(p)) playerTotals[p] += set.teamBScore;
    });
  });

  return (
    <div>
      <div style={{ fontSize: '13px', fontWeight: 500, color: '#c7c9d4', marginBottom: '6px' }}>
        Sets <span style={{ color: '#7d8091', fontWeight: 400 }}>· completed only</span>
      </div>
      <div style={{ border: '1px solid #2a2f42', borderRadius: '6px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#3a4bb8' }}>
              <th style={{ textAlign: 'left', padding: '7px 10px', fontWeight: 500, color: '#fff' }}>Set</th>
              {players.map(p => (
                <th key={p} style={{ textAlign: 'right', padding: '7px 10px', fontWeight: 500, color: '#fff' }}>{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {setHistory.length === 0 ? (
              <tr>
                <td colSpan={players.length + 1} style={{ padding: '16px 10px', textAlign: 'center', color: '#64748b', background: '#fff' }}>
                  No completed sets yet
                </td>
              </tr>
            ) : (
              <>
                <tr style={{ background: '#f2f2ec', color: '#1a1a1a', fontWeight: 500 }}>
                  <td style={{ padding: '7px 10px' }}>Total</td>
                  {players.map(p => (
                    <td key={p} style={{ padding: '7px 10px', textAlign: 'right', color: playerTotals[p] >= 0 ? '#1a7a3a' : '#c02020' }}>
                      {playerTotals[p].toFixed(0)}
                    </td>
                  ))}
                </tr>
                {setHistory.slice().reverse().map((set, idx) => (
                  <tr key={idx} style={{ background: '#fff', color: '#1a1a1a', borderTop: '1px solid #ddd' }}>
                    <td style={{ padding: '7px 10px' }}>{idx + 1}</td>
                    {players.map(p => {
                      let val = null;
                      if (set.teamA.includes(p)) val = set.teamAScore;
                      if (set.teamB.includes(p)) val = set.teamBScore;
                      return (
                        <td key={p} style={{ padding: '7px 10px', textAlign: 'right', color: val !== null ? '#3346c9' : '#999' }}>
                          {val !== null ? val.toFixed(0) : '–'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
