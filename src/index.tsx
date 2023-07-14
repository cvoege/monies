import { createRoot } from 'react-dom/client';
import { IncomeZone } from './pages/IncomeZone';
import { PeopleZone } from './pages/PeopleZone';
import { RetirementAccountZone } from './pages/RetirementAccountZone';
import { TaxZone } from './pages/TaxZone';
import { InvestmentZone } from './pages/InvestmentZone';
import {
  UserDataContext,
  startSignIn,
  startSignOut,
  useAuthUser,
  useUserDataFetch,
} from './modules/Firebase';

const App = () => {
  const userDataWhole = useUserDataFetch();
  const authUser = useAuthUser();

  return (
    <UserDataContext.Provider value={userDataWhole}>
      <div>
        {authUser ? (
          <>
            {userDataWhole.userData ? (
              <>
                <button onClick={startSignOut}>Sign Out</button>
                <PeopleZone />
                <IncomeZone />
                <RetirementAccountZone />
                <TaxZone />
                <InvestmentZone />
              </>
            ) : (
              <div>Loading...</div>
            )}
          </>
        ) : (
          <button onClick={startSignIn}>Sign In</button>
        )}
      </div>
    </UserDataContext.Provider>
  );
};

const rootElem = document.getElementById('root');
if (rootElem) {
  const root = createRoot(rootElem);
  root.render(<App />);
} else {
  throw new Error('Could not find `root` element.');
}
