import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, StarFilledIcon } from './icons';

const TEAM_A_COLOR = '#7fdba0';
const TEAM_A_SOFT = '#9fe8bc';
const TEAM_B_COLOR = '#f5b955';
const TEAM_B_SOFT = '#f9d9a3';

const colGroup = (
  <colgroup>
    <col style={{ width: '22%' }} />
    <col style={{ width: '39%' }} />
    <col style={{ width: '39%' }} />
  </colgroup>
);

export default function CurrentGameCard({ theme, fontScale = 1, dealers, hands, teamA, teamB, totA, totB, currentDealerIdx, onEditHand }) {
  const c = theme;
  const px = (n) => `${n * fontScale}px`;
  const [expanded, setExpanded] = useState(true);

  const upcomingDealer = dealers.length > 0 ? dealers[currentDealerIdx] : null;

  return (
    <div style={{ border: `1px solid ${c.panelBorder}`, borderRadius: '10px', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: px(12), tableLayout: 'fixed' }}>
        {colGroup}
        <thead>
          <tr style={{ background: c.panelBg2 }}>
            <th style={{ textAlign: 'left', padding: '9px 14px', fontSize: px(11), fontWeight: 500, color: c.textDim }}>
              Dealer
            </th>
            <th style={{ textAlign: 'right', padding: '9px 14px', fontSize: px(10), fontWeight: 500, color: TEAM_A_COLOR, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              <div>Team A</div>
              <div style={{ fontSize: px(11), color: TEAM_A_SOFT, textTransform: 'none', fontWeight: 400, marginTop: '2px' }}>
                {teamA.join(', ') || '—'}
              </div>
            </th>
            <th style={{ textAlign: 'right', padding: '9px 14px', fontSize: px(10), fontWeight: 500, color: TEAM_B_COLOR, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              <div>Team B</div>
              <div style={{ fontSize: px(11), color: TEAM_B_SOFT, textTransform: 'none', fontWeight: 400, marginTop: '2px' }}>
                {teamB.join(', ') || '—'}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            onClick={() => setExpanded(e => !e)}
            style={{ cursor: 'pointer', borderTop: `1px solid ${c.panelBorder}`, background: c.panelBg }}
          >
            <td style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '6px', color: c.text, fontWeight: 500, whiteSpace: 'nowrap' }}>
              Total
              {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
            </td>
            <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: px(18), fontWeight: 500, fontFamily: 'ui-monospace, monospace', color: TEAM_A_COLOR }}>
              {totA.toFixed(0)}
            </td>
            <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: px(18), fontWeight: 500, fontFamily: 'ui-monospace, monospace', color: TEAM_B_COLOR }}>
              {totB.toFixed(0)}
            </td>
          </tr>
        </tbody>
      </table>

      {expanded && (
        <div style={{ borderTop: `1px solid ${c.panelBorder}`, background: c.panelBg }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: px(12), tableLayout: 'fixed' }}>
            {colGroup}
            <tbody>
              {hands.length === 0 && !upcomingDealer && (
                <tr>
                  <td colSpan={3} style={{ padding: '12px 14px', textAlign: 'center', color: c.textDim }}>
                    No hands yet
                  </td>
                </tr>
              )}
              {hands.map((h, idx) => (
                <tr
                  key={idx}
                  onClick={() => onEditHand(idx)}
                  style={{ borderTop: `1px solid ${c.panelBorder}`, cursor: 'pointer' }}
                >
                  <td style={{ padding: '8px 14px', color: c.text }}>{h.dealer}</td>
                  <td style={{ padding: '8px 14px', textAlign: 'right', color: TEAM_A_COLOR }}>{h.scoreA}</td>
                  <td style={{ padding: '8px 14px', textAlign: 'right', color: TEAM_B_COLOR }}>{h.scoreB}</td>
                </tr>
              ))}
              {upcomingDealer && (
                <tr style={{ borderTop: `1px solid ${c.panelBorder}`, background: c.rowAltBg }}>
                  <td style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', color: c.text }}>
                    {upcomingDealer} <StarFilledIcon />
                  </td>
                  <td style={{ padding: '8px 14px', textAlign: 'right', color: TEAM_A_COLOR }}>–</td>
                  <td style={{ padding: '8px 14px', textAlign: 'right', color: TEAM_B_COLOR }}>–</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
