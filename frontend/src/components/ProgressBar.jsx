const STEPS = [
  { n: 1, label: 'Provider'  },
  { n: 2, label: 'Module'    },
  { n: 3, label: 'Variables' },
  { n: 4, label: 'Generate'  },
];

export default function ProgressBar({ current }) {
  return (
    <div className="progress-bar">
      {STEPS.map(({ n, label }) => {
        const state = current > n ? 'done' : current === n ? 'active' : '';
        return (
          <div key={n} className={`progress-step ${state}`}>
            <div className="step-circle">
              {current > n ? '✓' : n}
            </div>
            <span className="step-label">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
