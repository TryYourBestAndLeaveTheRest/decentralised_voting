import Nat "mo:base/Nat";
import List "mo:base/List";
import Array "mo:base/Array";
// import Debug "mo:base/Debug";

actor PollingSystem {
  public query func greet(name : Text) : async Text {
    return "Hello, " # name # "!";
  };

  type Vote = {
    option : Text;
    count : Nat;
  };

  type Poll = {
    question : Text;
    options : [Text];
    votes : List.List<Vote>;
  };

  stable var polls : [Poll] = [];

  public func createPoll(question : Text, options : [Text]) : async [Poll] {
    var votes : List.List<Vote> = List.nil<Vote>();
    for (option in options.vals()) {
      votes := List.push<Vote>({ option = option; count = 0 }, votes);
    };
    let newPoll : Poll = {
      question = question;
      options = options;
      votes = votes;
    };
    polls := Array.append<Poll>(polls, [newPoll]);
    return polls;
  };
  public func castVote(pollIndex : Nat, option : Text) : async () {
    assert (pollIndex < Array.size(polls));

    // Retrieve the poll at the given index
    let poll = polls[pollIndex];

    // Create an updated list of votes
    var updatedVotes : List.List<Vote> = List.nil<Vote>();

    // Iterate through the current votes and update the count for the selected option
    List.iterate<Vote>(
      poll.votes,
      func(vote : Vote) {
        if (vote.option == option) {
          // Increase the count for the selected option
          updatedVotes := List.push<Vote>({ option = vote.option; count = Nat.add(vote.count, 1) }, updatedVotes);
        } else {
          // Keep the count unchanged for other options
          updatedVotes := List.push<Vote>(vote, updatedVotes);
        };
      },
    );

    // Create a new poll with the updated votes
    let updatedPoll : Poll = { 
      question = poll.question;
      options = poll.options;
      votes = updatedVotes; 
    };

    // Create a new polls array with the updated poll
    var updatedPolls = Array.tabulate<Poll>(
        Array.size(polls),
        func(i : Nat) : Poll {
            if (i == pollIndex) {
                return updatedPoll;
            } else {
                return polls[i];
            };
        }
    );

    polls := updatedPolls;
};
  public func viewResults(pollIndex : Nat) : async List.List<Vote> {
    assert (pollIndex < Array.size(polls));
    return polls[pollIndex].votes;
  };

  public func getPoll(pollIndex : Nat) : async ?Poll {

    if (pollIndex < Array.size(polls)) {
      return ?polls[pollIndex];
    } else {
      return null;
    };
  };
  public func getAllPoll() : async [Poll] {
    return polls;
  };

    // Debug.print(debug_show (polls[1]));
};
