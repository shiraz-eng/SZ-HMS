export default function DoctorIndex() {
  return (
    <div className="grid h-full place-items-center p-8 text-center">
      <div className="max-w-xs">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M8 7h13M8 12h13M8 17h13M3 7h.01M3 12h.01M3 17h.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h1 className="mt-4 text-base font-semibold">Select a patient</h1>
        <p className="mt-1 text-sm text-muted-fg">
          Pick someone from today&rsquo;s queue to open their EHR.
        </p>
      </div>
    </div>
  );
}
