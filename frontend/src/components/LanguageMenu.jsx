import Dropdown from './ui/Dropdown';
import { cx, focusRing } from './ui/styles';
import { useLanguage } from '../hooks/useLanguage';

export default function LanguageMenu() {
  const { language, setLanguage, languages, currentLanguage, t } = useLanguage();

  return (
    <Dropdown
      label={t('language', 'Language')}
      title={t('selectLanguage', 'Select language')}
      align="right"
      buttonClassName="flex h-10 items-center gap-1.5 rounded-full px-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 sm:px-3"
      panelClassName="sm:w-60"
      trigger={
        <>
          {/* Globe Icon */}
          <svg
            className="h-5 w-5 shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a14.5 14.5 0 0 0 0 20M12 2a14.5 14.5 0 0 1 0 20M2 12h20" />
          </svg>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            {currentLanguage.short}
          </span>
          <svg
            className="hidden h-3.5 w-3.5 text-slate-400 sm:block"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </>
      }
    >
      {({ close }) => (
        <div className="p-1.5">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            {t('selectLanguage', 'Select language')}
          </div>
          <div className="space-y-0.5" role="radiogroup" aria-label={t('selectLanguage', 'Select language')}>
            {languages.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => {
                    setLanguage(lang.code);
                    close();
                  }}
                  className={cx(
                    'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors',
                    focusRing,
                    isSelected
                      ? 'bg-sky-50 font-medium text-sky-900'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
                  )}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium leading-snug">
                      {lang.nativeName}
                    </span>
                    <span className={cx('text-xs leading-snug', isSelected ? 'text-sky-700' : 'text-slate-500')}>
                      {lang.name}
                    </span>
                  </div>

                  {isSelected && (
                    <svg
                      className="h-4 w-4 shrink-0 text-sky-800"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </Dropdown>
  );
}

