import { initializeApp } from 'firebase/app';
import {
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithPopup,
  // signInWithRedirect,
  UserCredential,
  signOut,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  CollectionReference,
  collection,
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from 'firebase/firestore';
import { debounce, noop } from 'lodash';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Income, newIncome } from './Income';
import { Investment, Account, Balance, newAccount, newInvestment, newBalance } from './Investment';
import { Person, defaultPerson } from './Person';
import { RetirementAccountInfo, defaultRetirementAccountInfo } from './RetirementAccount';

const SAVE_DEBOUNCE_BUFFER = 1000;

const firebaseConfig = {
  apiKey: 'AIzaSyD4MAB3a119mM5hkXC-zmSLG4I6NluZFUc',

  authDomain: 'monies-f1891.firebaseapp.com',

  projectId: 'monies-f1891',

  storageBucket: 'monies-f1891.appspot.com',

  messagingSenderId: '168224334790',

  appId: '1:168224334790:web:8127c1e0911215abd3c8c7',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let currentAuthUser = auth.currentUser;
let currentToken = null;

const handleSignIn = (user: User, token: string) => {
  currentAuthUser = user;
  currentToken = token;
  // eslint-disable-next-line no-console
  console.log('logged in', currentAuthUser, currentToken);
};

const handleSignOut = () => {
  currentAuthUser = null;
  currentToken = null;
  // eslint-disable-next-line no-console
  console.log('logged out');
};

const handleLoginPromise = (promise: Promise<UserCredential | null>) => {
  return promise
    .then((result) => {
      if (!result) {
        return;
      }
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        handleSignIn(user, token);
        // IdP data available using getAdditionalUserInfo(result)
        // ...
      } else {
        // eslint-disable-next-line no-console
        console.error('Login failed', result);
      }
    })
    .catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      // ...
      // eslint-disable-next-line no-console
      console.error({
        errorCode,
        errorMessage,
        email,
        credential,
      });
    });
};

const provider = new GoogleAuthProvider();
// provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
handleLoginPromise(getRedirectResult(auth));

export const startSignIn = () => {
  // signInWithRedirect(auth, provider);
  return handleLoginPromise(signInWithPopup(auth, provider));
};

export const startSignOut = () => {
  return signOut(auth)
    .then(() => {
      // Sign-out successful.
      handleSignOut();
    })
    .catch((error) => {
      // An error happened.
      // eslint-disable-next-line no-console
      console.error('Sign out failed', error);
    });
};

type UserData = {
  w2PaycheckFrequency: 'weekly' | 'every-two-weeks' | 'monthly' | 'twice-per-month';
  downloadStateLink: string | null;
  people: [Person] | [Person, Person];
  incomes: Array<Income>;
  retirementAccountInfo: RetirementAccountInfo;
  newInvestmentValue: number | null;
  investments: Array<Investment>;
  accounts: Array<Account>;
  balances: Array<Balance>;
};

type SetUserData = (value: UserData) => unknown;

export const defaultUserData: UserData = {
  w2PaycheckFrequency: 'twice-per-month',
  people: [defaultPerson()],
  incomes: [],
  downloadStateLink: null,
  retirementAccountInfo: defaultRetirementAccountInfo(),
  investments: [],
  accounts: [],
  balances: [],
  newInvestmentValue: 0,
};
const userCollection: CollectionReference<UserData> = collection(
  db,
  'users',
) as CollectionReference<UserData>;

export const useAuthUser = () => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setAuthUser(user || null);
    });
  }, []);

  return authUser;
};

export const useUserDataFetch = (): { userData: UserData | null; setUserData: SetUserData } => {
  const [cachedValue, setCachedValue] = useState<UserData | null>(null);
  const authUser = useAuthUser();
  const runSave = useCallback(
    async (data: UserData) => {
      if (!authUser?.uid) return;
      const docRef = doc<UserData>(userCollection, authUser.uid);
      try {
        await setDoc(docRef, data);
      } catch (e) {
        console.log('runSave error', e);
      }
    },
    [authUser],
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveToFirebase = useCallback(debounce(runSave, SAVE_DEBOUNCE_BUFFER), [runSave]);
  const setValue: SetUserData = useCallback(
    (value) => {
      setCachedValue(value);
      saveToFirebase(value);
    },
    [saveToFirebase],
  );

  const onUserLoaded = useCallback(
    async (user: User | null) => {
      if (user) {
        const docRef = doc<UserData>(userCollection, user.uid);
        const initialValue = await getDoc<UserData>(docRef);
        if (initialValue.exists()) {
          setCachedValue(initialValue.data());
        } else {
          setCachedValue(defaultUserData);
          saveToFirebase(defaultUserData);
        }
      } else {
        setCachedValue(null);
      }
    },
    [saveToFirebase],
  );

  useEffect(() => {
    onUserLoaded(authUser);
  }, [authUser, onUserLoaded]);

  return { userData: cachedValue, setUserData: setValue };
};

export const UserDataContext = createContext<{
  userData: UserData | null;
  setUserData: SetUserData;
}>({
  userData: defaultUserData,
  setUserData: noop,
});

export const useUserData = () => {
  return useContext(UserDataContext);
};

export const getActions = (userData: UserData, setUserData: SetUserData) => {
  const set = (fn: (current: UserData) => UserData) => setUserData(fn(userData));
  const get = () => userData;
  return {
    createIncome: () => {
      set((state) => ({
        ...state,
        incomes: [...state.incomes, newIncome(state.people[0].id)],
      }));
    },
    setIncome:
      (id: Income['id']) =>
      <K extends keyof Income>(key: K) =>
      (value: Income[K]) => {
        const incomeIndex = get().incomes.findIndex((income) => income.id === id);
        const income = get().incomes[incomeIndex];
        const updates =
          key === 'rateType' && value === 'hourly'
            ? { rateType: 'hourly' as const, hoursPerWeek: 0 }
            : { [key]: value };
        if (!income) return;

        set((state) => ({
          ...state,
          incomes: [
            ...state.incomes.slice(0, incomeIndex),
            { ...income, ...updates },
            ...state.incomes.slice(incomeIndex + 1),
          ],
        }));
      },
    switchPersonSetting: () => {
      const { people } = get();
      if (people.length === 1) {
        set((state) => ({
          ...state,
          people: [people[0], defaultPerson()],
        }));
      } else {
        set((state) => ({
          ...state,
          people: [people[0]],
        }));
      }
    },
    setPerson:
      (id: Person['id']) =>
      <K extends keyof Person>(key: K) =>
      (value: Person[K]) => {
        const { people } = get();
        const personIndex = people.findIndex((person) => person.id === id);
        const result: typeof people = [
          personIndex === 0 ? { ...people[0], [key]: value } : people[0],
        ];
        if (people.length === 2)
          result.push(personIndex === 1 ? { ...people[1], [key]: value } : people[1]);

        set((state) => ({
          ...state,
          people: result,
        }));
      },
    setField:
      <K extends keyof UserData>(key: K) =>
      (value: UserData[K]) => {
        set((s) => ({ ...s, [key]: value }));
      },
    setRetirementInfoField:
      <K extends keyof RetirementAccountInfo>(key: K) =>
      (value: RetirementAccountInfo[K]) => {
        set((s) => ({
          ...s,
          retirementAccountInfo: { ...s.retirementAccountInfo, [key]: value },
        }));
      },
    deletePerson: (id: Person['id']) => () => {
      set((s) => {
        if (s.people.length !== 2) return s;
        const index = s.people.findIndex((p) => p.id === id);
        const person = s.people[index];
        if (!person) return s;

        return {
          ...s,
          people: [s.people[index === 0 ? 1 : 0]],
          incomes: s.incomes.filter((i) => i.personId !== id),
        };
      });
    },
    deleteIncome: (id: Income['id']) => () => {
      set((s) => ({ ...s, incomes: s.incomes.filter((i) => i.id !== id) }));
    },
    setAccountField:
      (id: Account['id']) =>
      <K extends keyof Account>(key: K) =>
      (value: Account[K]) => {
        const accountIndex = get().accounts.findIndex((account) => account.id === id);
        const account = get().accounts[accountIndex];
        if (!account) return;

        set((state) => ({
          ...state,
          accounts: [
            ...state.accounts.slice(0, accountIndex),
            { ...account, [key]: value },
            ...state.accounts.slice(accountIndex + 1),
          ],
        }));
      },
    createAccount: () => {
      set((s) => ({ ...s, accounts: [...s.accounts, newAccount()] }));
    },
    deleteAccount: (id: Account['id']) => () => {
      set((s) => ({ ...s, accounts: s.accounts.filter((a) => a.id !== id) }));
    },
    setInvestmentField:
      (id: Investment['id']) =>
      <K extends keyof Investment>(key: K) =>
      (value: Investment[K]) => {
        const investmentIndex = get().investments.findIndex((investment) => investment.id === id);
        const investment = get().investments[investmentIndex];
        if (!investment) return;

        set((state) => ({
          ...state,
          investments: [
            ...state.investments.slice(0, investmentIndex),
            { ...investment, [key]: value },
            ...state.investments.slice(investmentIndex + 1),
          ],
        }));
      },
    createInvestment: () => {
      set((s) => ({ ...s, investments: [...s.investments, newInvestment()] }));
    },
    deleteInvestment: (id: Investment['id']) => () => {
      set((s) => ({ ...s, investments: s.investments.filter((a) => a.id !== id) }));
    },
    setBalance: (investmentId: string) => (accountId: string) => (value: number | null) => {
      const existingBalance =
        get().balances.find((b) => b.investmentId === investmentId && b.accountId === accountId) ||
        newBalance({ investmentId, accountId });
      set((s) => ({
        ...s,
        balances: [
          ...s.balances.filter((b) => b.id !== existingBalance.id),
          { ...existingBalance, value: value || 0 },
        ],
      }));
    },
  };
};
