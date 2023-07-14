import { SelectInput } from 'src/components/SelectInput';
import { paycheckFrequencyOptions } from 'src/modules/Income';
import { TextInput } from '../components/Input';
import { getActions, useUserData } from 'src/modules/Firebase';

export const PeopleZone = () => {
  const { userData, setUserData } = useUserData();
  if (!userData) {
    return <div>Loading...</div>;
  }
  const actions = getActions(userData, setUserData);

  const { people, w2PaycheckFrequency } = userData;

  return (
    <div>
      <h1>People</h1>
      {people.map((person) => {
        const setPerson = actions.setPerson(person.id);

        return (
          <div style={{ border: '1px solid black' }} key={person.id}>
            {person.name}
            <div>
              Name: <TextInput value={person.name} onChange={setPerson('name')} />
            </div>
            <div>
              {people.length === 2 && (
                <button onClick={actions.deletePerson(person.id)}>Delete</button>
              )}
            </div>
          </div>
        );
      })}
      {people.length === 1 && (
        <button onClick={actions.switchPersonSetting}>Switch to Joint</button>
      )}
      <p>
        W2 Paycheck Frequency:{' '}
        <SelectInput
          options={paycheckFrequencyOptions}
          value={w2PaycheckFrequency}
          onChange={actions.setField('w2PaycheckFrequency')}
        />
      </p>
    </div>
  );
};
