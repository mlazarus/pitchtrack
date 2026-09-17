import React, { useEffect, useRef, useState } from 'react';
import { MenuIcon, CloseIcon, StarFilledIcon, UsersIcon, FlagIcon, SquareCheckIcon, LogoutIcon } from './icons';

export default function GameHeaderBar({
  theme,
  currentTable,
  gameNumber,
  dealers,
  currentDealerIdx,
  currentSetGamesCount,
  onOpenDealerFlow,
  onOpenAddScore,
  onEndGame,
  onEndSet,
  onEndSession
}) {
  const c = theme;
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
    background: c.accent,
    color: c.accentText,
    border: 'none',
    borderRadius: '7px',
    padding: '9px 18px',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer'
  };

  const endGameButtonStyle = {
    background: c.dangerBg,
    color: c.danger,
    border: `1px solid ${c.dangerBorder}`,
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
    background: c.surfaceBg,
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
        background: c.panelBg2,
        border: `1px solid ${c.panelBorder}`,
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
                    background: i === currentDealerIdx ? c.accent : 'transparent',
                    color: i === currentDealerIdx ? c.accentText : c.text,
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
