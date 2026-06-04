namespace LuxHotel.Application.Search;

public readonly record struct AhoCorasickMatch(string Pattern, int StartIndex, int EndIndex);

public sealed class AhoCorasickMatcher
{
    private readonly List<Node> _nodes = [new Node()];
    private readonly HashSet<char> _alphabet = [];

    public AhoCorasickMatcher(IEnumerable<string> patterns)
    {
        foreach (var pattern in patterns.Select(pattern => pattern.Trim()).Where(pattern => pattern.Length > 0).Distinct())
        {
            Add(pattern);
        }

        BuildAutomaton();
    }

    public bool ContainsAny(string text)
    {
        return FindOccurrences(text).Any();
    }

    public IEnumerable<string> Find(string text)
    {
        return FindOccurrences(text).Select(match => match.Pattern);
    }

    public IEnumerable<AhoCorasickMatch> FindOccurrences(string text)
    {
        if (_nodes.Count == 1 || string.IsNullOrEmpty(text))
        {
            yield break;
        }

        var state = 0;
        for (var index = 0; index < text.Length; index++)
        {
            state = Go(state, text[index]);

            foreach (var pattern in _nodes[state].Outputs)
            {
                yield return new AhoCorasickMatch(pattern, index - pattern.Length + 1, index);
            }

            for (var exit = _nodes[state].Exit; exit != -1; exit = _nodes[exit].Exit)
            {
                foreach (var pattern in _nodes[exit].Outputs)
                {
                    yield return new AhoCorasickMatch(pattern, index - pattern.Length + 1, index);
                }
            }
        }
    }

    private void Add(string pattern)
    {
        var state = 0;
        foreach (var character in pattern)
        {
            _alphabet.Add(character);
            if (!_nodes[state].Next.TryGetValue(character, out var nextState))
            {
                nextState = _nodes.Count;
                _nodes[state].Next[character] = nextState;
                _nodes.Add(new Node());
            }

            state = nextState;
        }

        _nodes[state].Outputs.Add(pattern);
    }

    private void BuildAutomaton()
    {
        foreach (var character in _alphabet)
        {
            _nodes[0].Go[character] = _nodes[0].Next.TryGetValue(character, out var nextState) ? nextState : 0;
        }

        var queue = new Queue<int>();
        foreach (var child in _nodes[0].Next.Values)
        {
            _nodes[child].Failure = 0;
            queue.Enqueue(child);
        }

        while (queue.Count > 0)
        {
            var state = queue.Dequeue();
            var failure = _nodes[state].Failure;
            _nodes[state].Exit = _nodes[failure].Outputs.Count > 0 ? failure : _nodes[failure].Exit;

            foreach (var character in _alphabet)
            {
                if (_nodes[state].Next.TryGetValue(character, out var target))
                {
                    _nodes[state].Go[character] = target;
                    _nodes[target].Failure = Go(failure, character);
                    queue.Enqueue(target);
                    continue;
                }

                _nodes[state].Go[character] = Go(failure, character);
            }
        }
    }

    private int Go(int state, char character)
    {
        return _nodes[state].Go.TryGetValue(character, out var nextState) ? nextState : 0;
    }

    private sealed class Node
    {
        public Dictionary<char, int> Next { get; } = [];
        public Dictionary<char, int> Go { get; } = [];
        public int Failure { get; set; }
        public int Exit { get; set; } = -1;
        public List<string> Outputs { get; } = [];
    }
}
