import { createRoot } from 'react-dom/client';
import { actions, useSaved, useStore } from './modules/Store';
import { IncomeZone } from './pages/IncomeZone';
import { PeopleZone } from './pages/PeopleZone';
import { RetirementAccountZone } from './pages/RetirementAccountZone';
import { TaxZone } from './pages/TaxZone';
import { InvestmentZone } from './pages/InvestmentZone';

const App = () => {
  const saved = useSaved();
  const { downloadStateLink } = useStore((s) => ({ downloadStateLink: s.downloadStateLink }), []);

  return (
    <div>
      <p>
        {saved ? 'Saved' : 'Saving...'}
        <button onClick={actions.clearState}>Clear Saved State</button>
        <button onClick={actions.downloadState}>Download State</button>
        {downloadStateLink && (
          <a
            href={downloadStateLink}
            target="_blank"
            rel="noopener noreferrer"
            download={`monies-${new Date().toLocaleString()}.json`}
          >
            Download
          </a>
        )}
      </p>
      <p>
        <label>Upload Saved State</label>
        <input type="file" onChange={actions.uploadState} />
      </p>
      <PeopleZone />
      <IncomeZone />
      <RetirementAccountZone />
      <TaxZone />
      <InvestmentZone />
    </div>
  );
};

const rootElem = document.getElementById('root');
if (rootElem) {
  const root = createRoot(rootElem);
  root.render(<App />);
} else {
  throw new Error('Could not find `root` element.');
}
