import { useState,useEffect } from 'react';
import { decentralised_voting_backend } from 'declarations/decentralised_voting_backend';
const flattenVotes = (votes) => {
  const result = [];

  const recurse = (arr) => {
    arr.forEach((item) => {
      if (Array.isArray(item)) {
        recurse(item); // Recursive call for nested arrays
      } else if (item.option) {
        result.push(item); // Collect valid vote objects
      }
    });
  };

  recurse(votes);
  return result;
};

function PollList({ onSelectPoll }) {
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const fetchedPolls = await decentralised_voting_backend.getAllPoll();
        setPolls(fetchedPolls || []);
      } catch (error) {
        console.error("Failed to fetch polls:", error);
      }
    };
    fetchPolls();
  }, []);

  return (
    <div>
      <h1>Polls</h1>
      <p className='description-polls'>Please click on the poll that you want to vote</p>
      <ul>
        {polls.map((poll, index) => (
          <li key={index} className='poll-list'>
            <h3>{poll.question}</h3>
            <button onClick={() => onSelectPoll(index)}>View Poll</button> {/* Call the onSelectPoll function */}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PollDetails({ pollIndex }) {
  const [poll, setPoll] = useState(null);
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const response = await decentralised_voting_backend.getPoll(pollIndex);
        if (response) {
          const formattedPoll = {
            question: response[0].question,
            options: response[0].options,
            votes: flattenVotes(response[0].votes),
          };
          setPoll(formattedPoll);
          setResults(formattedPoll.votes);
        } else {
          console.error("Invalid poll data received:", response);
        }
      } catch (error) {
        console.error("Error fetching poll:", error);
      }
    };
    fetchPoll();
  }, [pollIndex]);

  const handleVote = async (option) => {
    try {
      await decentralised_voting_backend.castVote(pollIndex, option);
      const updatedResults = await decentralised_voting_backend.viewResults(pollIndex);
      setResults(flattenVotes(updatedResults));
    } catch (error) {
      console.error("Error casting vote:", error);
    }
  };



  return (
    poll ? (
      <div className='card'>
        <h2>{poll.question}</h2>
        <ul>
          {poll.options.map((option, index) => (
            <li key={index}>
              <button onClick={() => handleVote(option)}>{option}</button>
            </li>
          ))}
        </ul>
        <h3>Results:</h3>
        <ul>
          {results.map((vote, index) => (
            <li key={index}>
              {vote.option}: {Number(vote.count)}
            </li>
          ))}
        </ul>
      </div>
    ) : (
      <div>Loading...</div>
    )
  );
}

function CreatePoll() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['']);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  const handleSubmit = async () => {
    try {
      await decentralised_voting_backend.createPoll(question, options);
      setQuestion(''); // Reset the question field
      setOptions(['']); // Reset the options field
    } catch (error) {
      console.error("Failed to create poll:", error);
    }
  };

  return (
    <div className='card'>
      <h2>Create a New Poll</h2>
      <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Poll Question" />
      {options.map((option, index) => (
        <input
          key={index}
          type="text"
          value={option}
          onChange={(e) => handleOptionChange(index, e.target.value)}
          placeholder={`Option ${index + 1}`}
        />
      ))}
      <button onClick={() => setOptions([...options, ''])}>Add Option</button>
      <button onClick={handleSubmit}>Create Poll</button>
    </div>
  );
}



function App() {

  const [greeting, setGreeting] = useState('');
  const [selectedPollIndex, setSelectedPollIndex] = useState(null);
  const test = async () => {
    const response = await decentralised_voting_backend.getAllPoll()
    console.dir(response)
  }
  async function handleSubmit(event) {
    event.preventDefault();
    const name = event.target.elements.name.value;
    try {
      const greeting = await decentralised_voting_backend.greet(name);
      setGreeting(greeting);
    } catch (error) {
      console.error("Failed to get greeting:", error);
    }

    return false;
  }

  return (

    <main>
      <img src="/logo2.svg" alt="DFINITY logo" />
      <br />
      <br />
      <form action="#" onSubmit={handleSubmit}>
        <label htmlFor="name">Enter your name: &nbsp;</label>
        <input id="name" alt="Name" type="text" />
        <button type="submit">Click Me!</button>
      </form>
      <section id="greeting">{greeting}</section>
      <div>
        <button onClick={test}>testing here</button>
      </div>
      <section id='vote-page'>
        <div>
          <h1>Decentralized Polling System</h1>
          {selectedPollIndex === null ? (
            <>
              <PollList onSelectPoll={(index) => setSelectedPollIndex(index)} />
              <CreatePoll />
            </>
          ) : (
            <PollDetails pollIndex={selectedPollIndex} />
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
