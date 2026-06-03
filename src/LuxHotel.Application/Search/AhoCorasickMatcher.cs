namespace LuxHotel.Application.Search;

public sealed class AhoCorasickMatcher
{
    private readonly List<Node> _nodes = [new Node()];

    public AhoCorasickMatcher(IEnumerable<string> patterns)
    {
        foreach (var pattern in patterns.Select(pattern => pattern.Trim()).Where(pattern => pattern.Length > 0).Distinct())
        {
            Add(pattern);
        }

        BuildFailureLinks();
    }

    public bool ContainsAny(string text)
    {
        return Find(text).Any();
    }

    public IEnumerable<string> Find(string text)
    {
        if (_nodes.Count == 1 || string.IsNullOrEmpty(text))
        {
            yield break;
        }

        var state = 0;
        foreach (var character in text)
        {
            while (state != 0 && !_nodes[state].Next.ContainsKey(character))
            {
                state = _nodes[state].Failure;
            }

            if (_nodes[state].Next.TryGetValue(character, out var nextState))
            {
                state = nextState;
            }

            foreach (var pattern in _nodes[state].Outputs)
            {
                yield return pattern;
            }
        }
    }

    private void Add(string pattern)
    {
        var state = 0;
        foreach (var character in pattern)
        {
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

    private void BuildFailureLinks()
    {
        var queue = new Queue<int>();
        foreach (var child in _nodes[0].Next.Values)
        {
            queue.Enqueue(child);
        }

        while (queue.Count > 0)
        {
            var state = queue.Dequeue();
            foreach (var transition in _nodes[state].Next)
            {
                var character = transition.Key;
                var target = transition.Value;
                queue.Enqueue(target);

                var failure = _nodes[state].Failure;
                while (failure != 0 && !_nodes[failure].Next.ContainsKey(character))
                {
                    failure = _nodes[failure].Failure;
                }

                if (_nodes[failure].Next.TryGetValue(character, out var fallback))
                {
                    _nodes[target].Failure = fallback;
                    _nodes[target].Outputs.AddRange(_nodes[fallback].Outputs);
                }
            }
        }
    }

    private sealed class Node
    {
        public Dictionary<char, int> Next { get; } = [];
        public int Failure { get; set; }
        public List<string> Outputs { get; } = [];
    }
}
