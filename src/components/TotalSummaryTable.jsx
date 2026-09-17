import React from 'react';

const GAME_COLUMNS = 3;

// Renders one team's cell for a given game column index (0-based).
function gameCell(index, completedGames, scoreKey) {
  if (index < completedGames.length) {
    return completedGames[index][scoreKey].toFixed(0);
  }
  if (index === completedGames.length) {
    return '***';
  }
  return '–';
}

export default function TotalSummaryTable({ theme, fontScale = 1, teamA, teamB, currentSetGames }) {
  const c = theme;
  const px = (n) => `${n * fontScale}px`;
  const inProgress = currentSetGames.length < GAME_COLUMNS;
  const inProgressGameNumber = currentSetGames.length + 1;

  const totalSoFarA = currentSetGames.reduce((sum, g) => sum + g.scoreA, 0);
  const totalSoFarB = currentSetGames.reduce((sum, g) => sum + g.scoreB, 0);

  const columnIndexes = Array.from({ length: GAME_COLUMNS }, (_, i) => i);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
        <span style={{ fontSize: px(13), fontWeight: 500, color: c.text }}>Total summary</span>
        {inProgress && (
          <span style={{
            fontSize: px(10),
            color: '#8a6a2a',
            background: c.isDark ? '#2a2308' : '#f5e8c8',
            padding: '2px 8px',
            borderRadius: '999px',
            fontWeight: 500
          }}>
            Game {inProgressGameNumber} in progress
          </span>
        )}
      </div>
      <div style={{ border: `1px solid ${c.panelBorder}`, borderRadius: '6px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: px(12) }}>
          <thead>
            <tr style={{ background: c.accent }}>
              <th style={{ textAlign: 'left', padding: '7px 10px', fontWeight: 500, color: c.accentText }}>Team</th>
              <th style={{ textAlign: 'left', padding: '7px 10px', fontWeight: 500, color: c.accentText }}>Players</th>
              {columnIndexes.map(i => (
                <th key={i} style={{ textAlign: 'right', padding: '7px 10px', fontWeight: 500, color: c.accentText }}>
                  {i + 1}
                </th>
              ))}
              <th style={{ textAlign: 'right', padding: '7px 10px', fontWeight: 500, color: c.accentText }}>Current total</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: '#e8dcc3', color: '#1a1a1a' }}>
              <td style={{ padding: '7px 10px', fontWeight: 500 }}>A</td>
              <td style={{ padding: '7px 10px' }}>{teamA.join(', ') || '–'}</td>
              {columnIndexes.map(i => {
                const val = gameCell(i, currentSetGames, 'scoreA');
                return (
                  <td key={i} style={{
                    padding: '7px 10px',
                    textAlign: 'right',
                    color: val === '***' ? '#8a6a2a' : val === '–' ? '#a89a7a' : undefined,
                    fontWeight: val === '***' ? 500 : undefined
                  }}>
                    {val}
                  </td>
                );
              })}
              <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 500 }}>{totalSoFarA.toFixed(0)}</td>
            </tr>
            <tr style={{ background: '#e8dcc3', color: '#1a1a1a', borderTop: '1px solid #cfc3a3' }}>
              <td style={{ padding: '7px 10px', fontWeight: 500 }}>B</td>
              <td style={{ padding: '7px 10px' }}>{teamB.join(', ') || '–'}</td>
              {columnIndexes.map(i => {
                const val = gameCell(i, currentSetGames, 'scoreB');
                return (
                  <td key={i} style={{
                    padding: '7px 10px',
                    textAlign: 'right',
                    color: val === '***' ? '#8a6a2a' : val === '–' ? '#a89a7a' : undefined,
                    fontWeight: val === '***' ? 500 : undefined
                  }}>
                    {val}
                  </td>
                );
              })}
              <td style={{ padding: '7px 10px', textAlign: 'right', fontWeight: 500 }}>{totalSoFarB.toFixed(0)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
