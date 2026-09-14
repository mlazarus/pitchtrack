import React, { useEffect, useRef, useState } from 'react';
import { MenuIcon, CloseIcon, StarFilledIcon, UsersIcon, FlagIcon, SquareCheckIcon, LogoutIcon } from './icons';

const COLORS = {
  bar: '#111420',
  border: '#1e2230',
  surface: '#20263c',
  surfaceBorder: '#454d6e',
  text: '#e8e9ed',
  textDim: '#9aa0b4',
  danger: '#f5a3a3',
  disabled: '#6a7188',
  indigo: '#5a55f0',
  secondaryBg: '#1a1e2b',
  secondaryBorder: '#2a2f42',
  secondaryText: '#c7c9d4'
};

const menuButtonStyle = {
  background: COLORS.secondaryBg,
  color: COLORS.secondaryText,
  border: `1px solid ${COLORS.secondaryBorder}`,
  borderRadius: '7px',
  width: '36px',
  height: '36px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const secondaryButtonStyle = {
  background: COLORS.secondaryBg,
  color: COLORS.secondaryText,
  border: `1px solid ${COLORS.secondaryBorder}`,
  borderRadius: '7px',
  padding: '9px 14px',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px'
};

const primaryButtonStyle = {
  background: COLORS.indigo,
  color: '#fff',
  border: 'none',
  borderRadius: '7px',
  padding: '9px 18px',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer'
};

const endGameButtonStyle = {
  background: '#2a1c22',
  color: COLORS.danger,
  border: '1px solid #4a2f38',
  borderRadius: '7px',
  padding: '9px 14px',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '6px'
};

const dropdownPanelStyle = {
  position: 'absolute',
  background: COLORS.surface,
  border: `1px solid ${COLORS.surfaceBorder}`,
  borderRadius: '10px',
  padding: '8px',
  zIndex: 20,
  boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
};

const menuItemStyle = (color, disabled) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  background: 'transparent',
  border: 'none',
  color,
  fontSize: '13px',
  padding: '9px 10px',
  borderRadius: '7px',
  cursor: disabled ? 'not-allowed' : 'pointer',
  textAlign: 'left',
  width: '100%'
});

export default function GameHeaderBar({
  currentTable,
  dealers,
  currentDealerIdx,
  currentSetGamesCount,
  onOpenDealerFlow,
  onOpenAddScore,
  onEndGame,
  onEndSet,
  onEndSession
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dealersOpen, setDealersOpen] = useState(false);
  const menuRef = useRef(null);
  const dealersRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (dealersRef.current && !dealersRef.current.contains(e.target)) {
        setDealersOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const dealersSet = dealers.length > 0;
  const endSetDisabled = currentSetGamesCount === 0;

  const handleDealersClick = () => {
    if (!dealersSet) {
      onOpenDealerFlow();
      return;
    }
    setDealersOpen(o => !o);
    setMenuOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        background: COLORS.bar,
        border: `1px solid ${COLORS.border}`,
        borderBottom: 'none',
        borderRadius: '14px 14px 0 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} ref={menuRef}>
          <button
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => { setMenuOpen(o => !o); setDealersOpen(false); }}
            style={menuButtonStyle}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
          <span style={{ fontWeight: 500, fontSize: '15px', color: COLORS.text }}>Table {currentTable}</span>

          {menuOpen && (
            <div style={{ ...dropdownPanelStyle, top: '44px', left: 0, width: '210px' }}>
              <button
                style={menuItemStyle(endSetDisabled ? COLORS.disabled : COLORS.text, endSetDisabled)}
                disabled={endSetDisabled}
                onClick={() => { if (endSetDisabled) return; setMenuOpen(false); onEndSet(); }}
              >
                <SquareCheckIcon /> End set ({currentSetGamesCount}/3)
              </button>
              <button style={menuItemStyle(COLORS.text, false)} onClick={() => { setMenuOpen(false); onEndSession(); }}>
                <span style={{ color: COLORS.textDim }}><LogoutIcon /></span> End session
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }} ref={dealersRef}>
          <button onClick={handleDealersClick} style={secondaryButtonStyle}>
            <span style={{ color: COLORS.textDim }}><UsersIcon /></span>
            <span>{dealersSet ? 'Dealers' : 'Set dealers'}</span>
          </button>

          <button onClick={onEndGame} style={endGameButtonStyle}>
            <FlagIcon /> End game
          </button>

          {dealersOpen && dealersSet && (
            <div style={{ ...dropdownPanelStyle, top: '44px', right: 0, width: '200px' }}>
              <div style={{
                fontSize: '11px',
                color: COLORS.textDim,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '4px 8px 6px'
              }}>
                Current dealer rotation
              </div>
              {dealers.map((d, i) => (
                <div
                  key={i}
                  style={{
                    background: i === currentDealerIdx ? COLORS.indigo : 'transparent',
                    color: i === currentDealerIdx ? '#fff' : COLORS.text,
                    fontSize: '13px',
                    padding: '7px 8px',
                    borderRadius: '7px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px'
                  }}
                >
                  {i === currentDealerIdx && <StarFilledIcon />}
                  {d}
                </div>
              ))}
            </div>
          )}

          <button onClick={onOpenAddScore} style={primaryButtonStyle}>Add score</button>
        </div>
      </div>
    </div>
  );
}
