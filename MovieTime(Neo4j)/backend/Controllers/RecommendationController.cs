[ApiController]
[Route("[controller]")]
public class RecommendationController : ControllerBase
{
    private readonly IDriver _neo4jDriver;

    public RecommendationController(IDriver neo4jDriver)
    {
        _neo4jDriver = neo4jDriver;

    }

    [HttpGet("RecommendMovieAccordingToFavoriteGenre/{userEmail}")]
    public async Task<ActionResult> ReturnMovieAccordingToFavoriteGenre(string userEmail)
    {
        try
        {
            await using var session = _neo4jDriver.AsyncSession();
      
            var queryMovie = @"
                MATCH (u:User {Email: $userEmail})-[:FAVORITE]->(m:Movie)
                RETURN m.Genre AS movieGenre
            ";

            var movieGenres = new List<string>();

            var resultMovie = await session.RunAsync(queryMovie, new {
                userEmail
            });

            await foreach (var record in resultMovie)
            {
                var genreMovie = record["movieGenre"].As<string>();
                movieGenres.Add(genreMovie);
            }

            // Grupisanje po zanru i brojanje pojavljivanja
            var genreGroups = movieGenres
                .GroupBy(g => g)
                .ToList();

            // Pronalazenje maksimalnog broja pojavljivanja
            var maxCount = genreGroups
                .Max(g => g.Count());

            // Svi zanrovi sa maksimalnim brojem pojavljivanja
            var favoriteGenresMovie = genreGroups
                .Where(g => g.Count() == maxCount)
                .Select(g => g.Key)
                .ToList();

            var queryRecommendMovie = @"
                MATCH (movie:Movie) 
                WHERE movie.Genre IN $favoriteGenresMovie
                AND NOT EXISTS((:User {Email: $userEmail})-[:FAVORITE]->(movie))
                RETURN movie.Duration AS Duration, movie.Name AS Name, movie.YearOfRelease AS YearOfRelease, movie.Genre AS Genre,
                movie.AvgScore as AvgScore, movie.Description as Description, movie.Image as Image, movie.Link as Link
            ";

             var result = await session.RunAsync(queryRecommendMovie, new {
                favoriteGenresMovie,
                userEmail
            });

            var movies = new List<Movie>();
            while (await result.FetchAsync())
            {
                Movie movie = new Movie
                {
                    Duration = int.Parse(result.Current["Duration"].As<string>()),
                    Name = result.Current["Name"].As<string>(),
                    YearOfRelease = int.Parse(result.Current["YearOfRelease"].As<string>()),
                    Genre = result.Current["Genre"].As<string>(),
                    AvgScore = double.Parse(result.Current["AvgScore"].As<string>()),
                    Description = result.Current["Description"].As<string>(),
                    Image = result.Current["Image"].As<string>(),
                    Link = result.Current["Link"].As<string>()
                };
    
                movies.Add(movie);
            }

            return Ok(movies);
        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpGet("RecommendTVShowAccordingToFavoriteGenre/{userEmail}")]
    public async Task<ActionResult> RecommendTVShowAccordingToFavoriteGenre(string userEmail)
    {
        try
        {
            await using var session = _neo4jDriver.AsyncSession();
      
            var queryShow = @"
                MATCH (u:User {Email: $userEmail})-[:FAVORITE]->(ts:TVShow)
                RETURN ts.Genre AS showGenre
            ";

            var showGenres = new List<string>();

            var resultShow = await session.RunAsync(queryShow, new {
                userEmail
            });

            await foreach (var record in resultShow)
            {
                var genreShow = record["showGenre"].As<string>();
                showGenres.Add(genreShow);
            }

            // Grupisanje po zanru i brojanje pojavljivanja
            var genreGroups = showGenres
                .GroupBy(g => g)
                .ToList();

            // Pronalazenje maksimalnog broja pojavljivanja
            var maxCount = genreGroups
                .Max(g => g.Count());

            // Svi zanrovi sa maksimalnim brojem pojavljivanja
            var favoriteGenresShow = genreGroups
                .Where(g => g.Count() == maxCount)
                .Select(g => g.Key)
                .ToList();

            var queryRecommendShow = @"
                MATCH (ts:TVShow) 
                WHERE ts.Genre IN $favoriteGenresShow
                AND NOT EXISTS((:User {Email: $userEmail})-[:FAVORITE]->(ts))
                RETURN ts.NumOfSeasons AS NumOfSeasons, ts.Name AS Name, ts.YearOfRelease AS YearOfRelease, 
                ts.Genre AS Genre, ts.AvgScore as AvgScore, ts.Description as Description, ts.Image as Image, 
                ts.Link as Link 
            ";

             var result = await session.RunAsync(queryRecommendShow, new {
                favoriteGenresShow,
                userEmail
            });

            var shows = new List<TVShow>();
            while (await result.FetchAsync())
            {
                TVShow tvShow = new TVShow
                {
                    NumOfSeasons = int.Parse(result.Current["NumOfSeasons"].As<string>()),
                    Name = result.Current["Name"].As<string>(),
                    YearOfRelease = int.Parse(result.Current["YearOfRelease"].As<string>()),
                    Genre = result.Current["Genre"].As<string>(),
                    AvgScore = double.Parse(result.Current["AvgScore"].As<string>()),
                    Description = result.Current["Description"].As<string>(),
                    Image = result.Current["Image"].As<string>(),
                    Link = result.Current["Link"].As<string>()
                };
    
                shows.Add(tvShow);
            }

            return Ok(shows);
        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}