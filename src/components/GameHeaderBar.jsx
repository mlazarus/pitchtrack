import React, { useEffect, useRef, useState } from 'react';
import { MenuIcon, CloseIcon, StarFilledIcon, UsersIcon, FlagIcon, SquareCheckIcon, LogoutIcon } from './icons';

const THEMES = {
  dark: {
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
    secondaryText: '#c7c9d4',
    endGameBg: '#2a1c22',
    endGameBorder: '#4a2f38'
  },
  light: {
    bar: '#f5f5f0',
    border: '#c0c0c0',
    surface: '#ffffff',
    surfaceBorder: '#999999',
    text: '#1a1a1a',
    textDim: '#555555',
    danger: '#b91c1c',
    disabled: '#999999',
    indigo: '#3a4bb8',
    secondaryBg: '#e8e8e8',
    secondaryBorder: '#b0b0b0',
    secondaryText: '#333333',
    endGameBg: '#fdecec',
    endGameBorder: '#e0a0a0'
  }
};

export default function GameHeaderBar({
  currentTable,
  gameNumber,
  theme = 'dark',
  dealers,
  currentDealerIdx,
  currentSetGamesCount,
  onOpenDealerFlow,
  onOpenAddScore,
  onEndGame,
  onEndSet,
  onEndSession
}) {
  const c = THEMES[theme] || THEMES.dark;
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

  const menuButtonStyle = {
    background: c.secondaryBg,
    color: c.secondaryText,
    border: `1px solid ${c.secondaryBorder}`,
    borderRadius: '7px',
    width: '36px',
    height: '36px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const secondaryButtonStyle = {
    background: c.secondaryBg,
    color: c.secondaryText,
    border: `1px solid ${c.secondaryBorder}`,
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
    background: c.indigo,
    color: '#fff',
    border: 'none',
    borderRadius: '7px',
    padding: '9px 18px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer'
  };

  const endGameButtonStyle = {
    background: c.endGameBg,
    color: c.danger,
    border: `1px solid ${c.endGameBorder}`,
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
    background: c.surface,
    border: `1px solid ${c.surfaceBorder}`,
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

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        background: c.bar,
        border: `1px solid ${c.border}`,
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
          <span style={{ fontWeight: 500, fontSize: '15px', color: c.text }}>Table {currentTable}</span>
          {gameNumber != null && (
            <span style={{ fontWeight: 500, fontSize: '15px', color: c.textDim }}>Game #{gameNumber}</span>
          )}

          {menuOpen && (
            <div style={{ ...dropdownPanelStyle, top: '44px', left: 0, width: '210px' }}>
              <button
                style={menuItemStyle(endSetDisabled ? c.disabled : c.text, endSetDisabled)}
                disabled={endSetDisabled}
                onClick={() => { if (endSetDisabled) return; setMenuOpen(false); onEndSet(); }}
              >
                <SquareCheckIcon /> End set ({currentSetGamesCount}/3)
              </button>
              <button style={menuItemStyle(c.text, false)} onClick={() => { setMenuOpen(false); onEndSession(); }}>
                <span style={{ color: c.textDim }}><LogoutIcon /></span> End session
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }} ref={dealersRef}>
          <button onClick={handleDealersClick} style={secondaryButtonStyle}>
            <span style={{ color: c.textDim }}><UsersIcon /></span>
            <span>{dealersSet ? 'Dealers' : 'Set dealers'}</span>
          </button>

          <button onClick={onEndGame} style={endGameButtonStyle}>
            <FlagIcon /> End game
          </button>

          {dealersOpen && dealersSet && (
            <div style={{ ...dropdownPanelStyle, top: '44px', right: 0, width: '200px' }}>
              <div style={{
                fontSize: '11px',
                color: c.textDim,
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
                    background: i === currentDealerIdx ? c.indigo : 'transparent',
                    color: i === currentDealerIdx ? '#fff' : c.text,
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
