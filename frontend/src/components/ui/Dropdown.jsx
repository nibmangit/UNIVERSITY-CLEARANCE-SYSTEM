import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { cx, focusRing } from './styles';

const DropdownContext = createContext({ close: () => {} });


export default function Dropdown({
  trigger,
  label,
  title,
  align = 'right',
  fullWidthOnMobile = false,
  buttonClassName,
  panelClassName,
  children,
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const panelId = useId();

  const close = useCallback(() => setOpen(false), []);
  const contextValue = useMemo(() => ({ close }), [close]);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) setOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const alignSide = align === 'right' ? 'right-0' : 'left-0';
  const smAlignSide = align === 'right' ? 'sm:right-0' : 'sm:left-0';

  const placement = fullWidthOnMobile
    ? cx(
        // Phones: pinned under the 4rem top bar, 0.75rem from each side, never taller than the screen.
        'fixed inset-x-3 top-[4.25rem] max-h-[calc(100dvh-5.5rem)] overflow-y-auto',
        // Larger screens: hangs under the button.
        'sm:absolute sm:inset-x-auto sm:top-auto sm:mt-2 sm:max-h-none sm:overflow-visible',
        smAlignSide,
      )
    : cx('absolute mt-2', alignSide);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        title={title}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
        className={cx(focusRing, buttonClassName)}
      >
        {trigger}
      </button>

      {open && (
        <div
          id={panelId}
          className={cx(
            'z-30 min-w-56 rounded-lg border border-slate-200 bg-white shadow-lg',
            placement,
            panelClassName,
          )}
        >
          <DropdownContext.Provider value={contextValue}>
            {typeof children === 'function' ? children({ close }) : children}
          </DropdownContext.Provider>
        </div>
      )}
    </div>
  );
}

/** A menu row: a link when `to` is given, otherwise a button. Closes the dropdown when used. */
export function DropdownItem({ to, onClick, tone = 'default', children }) {
  const { close } = useContext(DropdownContext);

  const classes = cx(
    'block w-full px-4 py-2.5 text-left text-sm',
    focusRing,
    tone === 'danger' ? 'text-red-700 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50',
  );

  if (to) {
    return (
      <Link to={to} onClick={close} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        close();
        onClick?.();
      }}
      className={classes}
    >
      {children}
    </button>
  );
}