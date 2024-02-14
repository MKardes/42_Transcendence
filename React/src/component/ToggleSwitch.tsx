import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange }) => {
  const toggleSwitchHandler = () => {
    onChange(!checked);
  };

  return (
    <label className="toggle-switch">
      <input
        type="checkbox"
        checked={checked}
        onChange={toggleSwitchHandler}
      />
      <span className="slider round"></span>
    </label>
  );
};

export default ToggleSwitch;
