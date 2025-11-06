import React from 'react';

interface TabsProps {
    children: React.ReactElement[];
    activeTab: string;
    onTabChange: (title: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ children, activeTab, onTabChange }) => {
    // FIX: The errors are caused by TypeScript not knowing the shape of the `props` on the child elements.
    // By using `React.Children.toArray` and casting the result, we create a correctly typed array of tab elements,
    // which allows safe access to `props.title` and `props.children` and resolves all related type errors.
    const tabs = React.Children.toArray(children).filter(React.isValidElement) as Array<React.ReactElement<{ title: string; children: React.ReactNode }>>;

    return (
        <div>
            <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map((child) => {
                        const title = child.props.title;
                        const isActive = activeTab === title;
                        return (
                            <button
                                key={title}
                                onClick={() => onTabChange(title)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                                    isActive
                                        ? 'border-sky-500 text-sky-600 dark:border-sky-400 dark:text-sky-400'
                                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-slate-500'
                                }`}
                                aria-current={isActive ? 'page' : undefined}
                            >
                                {title}
                            </button>
                        );
                    })}
                </nav>
            </div>
            <div>
                {tabs.map((child) => {
                    if (child.props.title !== activeTab) return undefined;
                    return child.props.children;
                })}
            </div>
        </div>
    );
};