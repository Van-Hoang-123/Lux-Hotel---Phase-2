using LuxHotel.Application.Search;

namespace LuxHotel.Tests.Search;

public class AhoCorasickMatcherTests
{
    [Fact]
    public void Matcher_finds_multiple_patterns_in_one_scan()
    {
        var matcher = new AhoCorasickMatcher(["spa", "villa", "private dining"]);

        var matches = matcher.Find("The beach villa includes private dining and a spa ritual.").ToList();

        Assert.Contains("villa", matches);
        Assert.Contains("private dining", matches);
        Assert.Contains("spa", matches);
    }

    [Fact]
    public void Matcher_reports_overlapping_suffix_matches_through_exit_links()
    {
        var matcher = new AhoCorasickMatcher(["he", "she", "hers", "his"]);

        var matches = matcher.FindOccurrences("ushers").ToList();

        Assert.Contains(new AhoCorasickMatch("she", 1, 3), matches);
        Assert.Contains(new AhoCorasickMatch("he", 2, 3), matches);
        Assert.Contains(new AhoCorasickMatch("hers", 2, 5), matches);
    }

    [Fact]
    public void Matcher_returns_false_when_no_pattern_matches()
    {
        var matcher = new AhoCorasickMatcher(["spa", "villa"]);

        Assert.False(matcher.ContainsAny("Quiet city breakfast"));
    }
}
