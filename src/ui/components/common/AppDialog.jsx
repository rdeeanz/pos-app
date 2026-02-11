"use client";

import { useEffect, useId, useRef } from "react";

export default function AppDialog({
  open,
  title,
  description,
  onClose,
  primaryAction,
  primaryLabel = "OK",
  closeLabel = "Tutup",
  hideFooter = false,
  overlayClassName = "",
  panelClassName = "",
  children,
}) {
  const closeBtnRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/50 p-4 ${overlayClassName}`}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : "Dialog"}
        aria-describedby={description ? descriptionId : undefined}
        className={`w-full max-w-md rounded-2xl bg-white p-5 shadow-xl ${panelClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title ? (
          <h3 id={titleId} className="text-base font-semibold text-zinc-900">
            {title}
          </h3>
        ) : null}

        {description ? (
          <p id={descriptionId} className="mt-1 text-sm text-zinc-600">
            {description}
          </p>
        ) : null}

        {children ? <div className="mt-3">{children}</div> : null}

        {!hideFooter ? (
          <div className="mt-5 flex justify-end gap-2">
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              className="rounded-lg border px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              {closeLabel}
            </button>
            {primaryAction ? (
              <button
                type="button"
                onClick={primaryAction}
                className="rounded-lg bg-zinc-900 px-3 py-2 text-sm text-white hover:bg-zinc-800"
              >
                {primaryLabel}
              </button>
            ) : null}
          </div>
        ) : (
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            className="sr-only"
            aria-label={closeLabel}
          >
            {closeLabel}
          </button>
        )}
      </div>
    </div>
  );
}
