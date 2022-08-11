import { TextInput } from '../components/Input';
import { useStore, actions } from '../modules/Store';

export const PeopleZone = () => {
  const { people } = useStore((s) => ({ people: s.people }), []);
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
          </div>
        );
      })}
      <button onClick={actions.switchPersonSetting}>
        Switch to {people.length === 1 ? 'Joint' : 'Single'}
      </button>
    </div>
  );
};
