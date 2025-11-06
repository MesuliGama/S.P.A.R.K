
import React from 'react';
import type { TemplateName, FontFamily, FontSize, Spacing } from '../types';

interface TemplateSelectorProps {
    currentTemplate: TemplateName;
    onTemplateChange: (template: TemplateName) => void;
    accentColor: string;
    onAccentColorChange: (color: string) => void;
    fontFamily: FontFamily;
    onFontFamilyChange: (font: FontFamily) => void;
    fontSize: FontSize;
    onFontSizeChange: (size: FontSize) => void;
    spacing: Spacing;
    onSpacingChange: (spacing: Spacing) => void;
}

const templates: { name: TemplateName; label: string }[] = [
    { name: 'classic', label: 'Classic' },
    { name: 'modern', label: 'Modern' },
    { name: 'professional', label: 'Professional' },
    { name: 'creative', label: 'Creative' },
];

const fontFamilies: { name: FontFamily; label: string }[] = [
    { name: 'sans', label: 'Sans Serif' },
    { name: 'serif', label: 'Serif' },
];

const fontSizes: { name: FontSize; label: string }[] = [
    { name: 'sm', label: 'S' },
    { name: 'base', label: 'M' },
    { name: 'lg', label: 'L' },
];

const spacings: { name: Spacing; label: string }[] = [
    { name: 'compact', label: 'Compact' },
    { name: 'normal', label: 'Normal' },
    { name: 'relaxed', label: 'Relaxed' },
];

const SegmentedControl = <T extends string>({ options, selected, onSelect, label }: { options: { name: T; label: string }[], selected: T, onSelect: (name: T) => void, label: string }) => (
    <div>
        <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">{label}</label>
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-700 p-1">
            {options.map(({ name, label }) => (
                <button
                    key={name}
                    onClick={() => onSelect(name)}
                    className={`w-full text-sm font-semibold py-1.5 px-3 rounded-md transition-colors ${
                        selected === name
                            ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                    aria-pressed={selected === name}
                >
                    {label}
                </button>
            ))}
        </div>
    </div>
);


export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
    currentTemplate, onTemplateChange,
    accentColor, onAccentColorChange,
    fontFamily, onFontFamilyChange,
    fontSize, onFontSizeChange,
    spacing, onSpacingChange,
}) => {
    return (
        <div className="bg-white dark:bg-slate-800/50 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800">
             <h2 className="text-lg font-semibold mb-4 text-slate-700 dark:text-slate-300">Template Options</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                
                <div className="sm:col-span-2">
                    <SegmentedControl options={templates} selected={currentTemplate} onSelect={onTemplateChange} label="Template" />
                </div>
                
                <SegmentedControl options={fontFamilies} selected={fontFamily} onSelect={onFontFamilyChange} label="Font Family" />
               
                <div>
                     <label htmlFor="accentColor" className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Accent Color</label>
                     <div className="relative h-10 w-full">
                        <input
                            id="accentColor"
                            type="color"
                            value={accentColor}
                            onChange={(e) => onAccentColorChange(e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                         <div 
                             className="h-full w-full block bg-white border border-slate-300 dark:border-slate-600 rounded-md"
                             style={{ backgroundColor: accentColor }}
                             aria-hidden="true"
                         ></div>
                     </div>
                </div>

                <div className="sm:col-span-2">
                    <SegmentedControl options={fontSizes} selected={fontSize} onSelect={onFontSizeChange} label="Font Size" />
                </div>
                
                <div className="sm:col-span-2">
                     <SegmentedControl options={spacings} selected={spacing} onSelect={onSpacingChange} label="Spacing" />
                </div>
            </div>
        </div>
    );
};