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


    [HttpGet("RecommendMovieAccordingToActor/{userEmail}")]
    public async Task<ActionResult> RecommendMovieAccordingToActor(string userEmail)
    {
        try
        {
            await using var session = _neo4jDriver.AsyncSession();
            int limit = 10;
            
            var queryMovie = @"
                MATCH (u:User {Email: $userEmail})-[:FAVORITE]->(m:Movie)
                RETURN m.Name as Name
            ";
            var movieNames = new List<string>();

            var resultMovie = await session.RunAsync(queryMovie, new { userEmail });

            await foreach (var record in resultMovie)
            {
                var name = record["Name"].As<string>();
                movieNames.Add(name);
            }

            if (movieNames.Count == 0)
            {
                return NotFound("No favorite movies found for the user.");
            }

            
            var queryFindActor = @"
                UNWIND $movieNames AS movieName
                MATCH (actor:Actor)-[:ACTED_IN]->(movie:Movie {Name: movieName})
                RETURN actor.FirstName AS FirstName, actor.LastName AS LastName, COUNT(movie) AS MovieCount
                ORDER BY MovieCount DESC
                LIMIT 1
            ";

            var resultActor = await session.RunAsync(queryFindActor, new { movieNames });
            string actorFirstName , actorLastName;

            if (await resultActor.FetchAsync())
            {
                actorFirstName = resultActor.Current["FirstName"].As<string>();
                actorLastName = resultActor.Current["LastName"].As<string>();
            }
            else
            {
                return NotFound("No actor found based on the user's favorite movies.");
            }

            
            var queryFindMoviesByActor = @"
                MATCH (actor:Actor {FirstName: $actorFirstName, LastName: $actorLastName})-[:ACTED_IN]->(m:Movie)
                WHERE NOT m.Name IN $movieNames
                RETURN m.Name AS Name, m.YearOfRelease AS YearOfRelease, 
                    m.Genre AS Genre, m.AvgScore AS AvgScore, 
                    m.Description AS Description, m.Image AS Image, 
                    m.Link AS Link, m.Duration as Duration
                ORDER BY m.AvgScore DESC
                LIMIT $limit
            ";

            var resultMovies = await session.RunAsync(queryFindMoviesByActor, new { actorFirstName, actorLastName ,movieNames, limit });

            var movies = new List<Movie>();
            while (await resultMovies.FetchAsync())
            {
                var movie = new Movie
                {
                    Name = resultMovies.Current["Name"].As<string>(),
                    Duration = resultMovies.Current["Duration"].As<int>(),
                    YearOfRelease = int.Parse(resultMovies.Current["YearOfRelease"].As<string>()),
                    Genre = resultMovies.Current["Genre"].As<string>(),
                    AvgScore = double.Parse(resultMovies.Current["AvgScore"].As<string>()),
                    Description = resultMovies.Current["Description"].As<string>(),
                    Image = resultMovies.Current["Image"].As<string>(),
                    Link = resultMovies.Current["Link"].As<string>()
                };

                movies.Add(movie);
            }

            return Ok(movies);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("RecommendTVShowAccordingToActor/{userEmail}")]
    public async Task<ActionResult> RecommendTVShowAccordingToActor(string userEmail)
    {
        try
        {
            await using var session = _neo4jDriver.AsyncSession();
            int limit = 10;
            
            var queryMovie = @"
                MATCH (u:User {Email: $userEmail})-[:FAVORITE]->(ts:TVShow)
                RETURN ts.Name as Name
            ";
            var TVShowNames = new List<string>();

            var resultTVShow = await session.RunAsync(queryMovie, new { userEmail });

            await foreach (var record in resultTVShow)
            {
                var name = record["Name"].As<string>();
                TVShowNames.Add(name);
            }

            if (TVShowNames.Count == 0)
            {
                return NotFound("No favorite TVShows found for the user.");
            }

            
            var queryFindActor = @"
                UNWIND $TVShowNames AS tvShowName
                MATCH (actor:Actor)-[:ACTED_IN]->(ts:TVShow {Name: tvShowName})
                RETURN actor.FirstName AS FirstName, actor.LastName AS LastName, COUNT(ts) AS TsCount
                ORDER BY TsCount DESC
                LIMIT 1
            ";

            var resultActor = await session.RunAsync(queryFindActor, new { TVShowNames });
            string actorFirstName , actorLastName;

            if (await resultActor.FetchAsync())
            {
                actorFirstName = resultActor.Current["FirstName"].As<string>();
                actorLastName = resultActor.Current["LastName"].As<string>();
            }
            else
            {
                return NotFound("No actor found based on the user's favorite tvShows.");
            }

            
            var queryFindTVShowsByActor = @"
                MATCH (actor:Actor {FirstName: $actorFirstName, LastName: $actorLastName})-[:ACTED_IN]->(ts:TVShow)
                WHERE NOT ts.Name IN $TVShowNames
                RETURN ts.Name AS Name, ts.YearOfRelease AS YearOfRelease, 
                    ts.Genre AS Genre, ts.AvgScore AS AvgScore, 
                    ts.Description AS Description, ts.Image AS Image, 
                    ts.Link AS Link, ts.NumOfSeasons as NumOfSeasons
                ORDER BY ts.AvgScore DESC
                LIMIT $limit
            ";

            var resultTVShows = await session.RunAsync(queryFindTVShowsByActor, new { actorFirstName, actorLastName ,TVShowNames, limit });

            var tvShows = new List<TVShow>();
            while (await resultTVShows.FetchAsync())
            {
                var tvShow = new TVShow
                {
                    Name = resultTVShows.Current["Name"].As<string>(),
                    NumOfSeasons = resultTVShows.Current["NumOfSeasons"].As<int>(),
                    YearOfRelease = int.Parse(resultTVShows.Current["YearOfRelease"].As<string>()),
                    Genre = resultTVShows.Current["Genre"].As<string>(),
                    AvgScore = double.Parse(resultTVShows.Current["AvgScore"].As<string>()),
                    Description = resultTVShows.Current["Description"].As<string>(),
                    Image = resultTVShows.Current["Image"].As<string>(),
                    Link = resultTVShows.Current["Link"].As<string>()
                };

                tvShows.Add(tvShow);
            }

            return Ok(tvShows);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }







     [HttpGet("RecommendMovieAccordingToDirector/{userEmail}")]
    public async Task<ActionResult> RecommendMovieAccordingToDirector(string userEmail)
    {
        try
        {
            await using var session = _neo4jDriver.AsyncSession();
            int limit = 10;
            
            var queryMovie = @"
                MATCH (u:User {Email: $userEmail})-[:FAVORITE]->(m:Movie)
                RETURN m.Name as Name
            ";
            var movieNames = new List<string>();

            var resultMovie = await session.RunAsync(queryMovie, new { userEmail });

            await foreach (var record in resultMovie)
            {
                var name = record["Name"].As<string>();
                movieNames.Add(name);
            }

            if (movieNames.Count == 0)
            {
                return NotFound("No favorite movies found for the user.");
            }

            
            var queryFindDirector = @"
                UNWIND $movieNames AS movieName
                MATCH (d:Director)-[:DIRECTED_IN]->(m:Movie {Name: movieName})
                RETURN d.FirstName AS FirstName, d.LastName AS LastName, COUNT(m) AS MovieCount
                ORDER BY MovieCount DESC
                LIMIT 1
            ";

            var resultDirector = await session.RunAsync(queryFindDirector, new { movieNames });
            string directorFirstName , directorLastName;

            if (await resultDirector.FetchAsync())
            {
                directorFirstName = resultDirector.Current["FirstName"].As<string>();
                directorLastName = resultDirector.Current["LastName"].As<string>();
            }
            else
            {
                return NotFound("No director found based on the user's favorite movies.");
            }

            var queryFindMoviesByDirector = @"
                MATCH (d:Director {FirstName: $directorFirstName, LastName: $directorLastName})-[:DIRECTED_IN]->(m:Movie)
                WHERE NOT m.Name IN $movieNames
                RETURN m.Name AS Name, m.YearOfRelease AS YearOfRelease, 
                    m.Genre AS Genre, m.AvgScore AS AvgScore, 
                    m.Description AS Description, m.Image AS Image, 
                    m.Link AS Link, m.Duration as Duration
                ORDER BY m.AvgScore DESC
                LIMIT $limit
            ";

            var resultMovies = await session.RunAsync(queryFindMoviesByDirector, new { directorFirstName, directorLastName , movieNames, limit });

            var movies = new List<Movie>();
            while (await resultMovies.FetchAsync())
            {
                var movie = new Movie
                {
                    Name = resultMovies.Current["Name"].As<string>(),
                    Duration = resultMovies.Current["Duration"].As<int>(),
                    YearOfRelease = int.Parse(resultMovies.Current["YearOfRelease"].As<string>()),
                    Genre = resultMovies.Current["Genre"].As<string>(),
                    AvgScore = double.Parse(resultMovies.Current["AvgScore"].As<string>()),
                    Description = resultMovies.Current["Description"].As<string>(),
                    Image = resultMovies.Current["Image"].As<string>(),
                    Link = resultMovies.Current["Link"].As<string>()
                };

                movies.Add(movie);
            }

            return Ok(movies);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }


    [HttpGet("RecommendTVShowAccordingToDirector/{userEmail}")]
    public async Task<ActionResult> RecommendTVShowAccordingToDirector(string userEmail)
    {
        try
        {
            await using var session = _neo4jDriver.AsyncSession();
            int limit = 10;
            
            var queryMovie = @"
                MATCH (u:User {Email: $userEmail})-[:FAVORITE]->(ts:TVShow)
                RETURN ts.Name as Name
            ";
            var TVShowNames = new List<string>();

            var resultTVShow = await session.RunAsync(queryMovie, new { userEmail });

            await foreach (var record in resultTVShow)
            {
                var name = record["Name"].As<string>();
                TVShowNames.Add(name);
            }

            if (TVShowNames.Count == 0)
            {
                return NotFound("No favorite TVShows found for the user.");
            }

            
            var queryFindDirector = @"
                UNWIND $TVShowNames AS tvShowName
                MATCH (d:Director)-[:DIRECTED_IN]->(ts:TVShow {Name: tvShowName})
                RETURN d.FirstName AS FirstName, d.LastName AS LastName, COUNT(ts) AS TsCount
                ORDER BY TsCount DESC
                LIMIT 1
            ";

            var resultDirector = await session.RunAsync(queryFindDirector, new { TVShowNames });
            string directorFirstName , directorLastName;

            if (await resultDirector.FetchAsync())
            {
                directorFirstName = resultDirector.Current["FirstName"].As<string>();
                directorLastName = resultDirector.Current["LastName"].As<string>();
            }
            else
            {
                return NotFound("No director found based on the user's favorite tvShows.");
            }

            
            var queryFindTVShowsByActor = @"
                MATCH (d:Director {FirstName: $directorFirstName, LastName: $directorLastName})-[:DIRECTED_IN]->(ts:TVShow)
                WHERE NOT ts.Name IN $TVShowNames
                RETURN ts.Name AS Name, ts.YearOfRelease AS YearOfRelease, 
                    ts.Genre AS Genre, ts.AvgScore AS AvgScore, 
                    ts.Description AS Description, ts.Image AS Image, 
                    ts.Link AS Link, ts.NumOfSeasons as NumOfSeasons
                ORDER BY ts.AvgScore DESC
                LIMIT $limit
            ";

            var resultTVShows = await session.RunAsync(queryFindTVShowsByActor, new { directorFirstName, directorLastName ,TVShowNames, limit });

            var tvShows = new List<TVShow>();
            while (await resultTVShows.FetchAsync())
            {
                var tvShow = new TVShow
                {
                    Name = resultTVShows.Current["Name"].As<string>(),
                    NumOfSeasons = resultTVShows.Current["NumOfSeasons"].As<int>(),
                    YearOfRelease = int.Parse(resultTVShows.Current["YearOfRelease"].As<string>()),
                    Genre = resultTVShows.Current["Genre"].As<string>(),
                    AvgScore = double.Parse(resultTVShows.Current["AvgScore"].As<string>()),
                    Description = resultTVShows.Current["Description"].As<string>(),
                    Image = resultTVShows.Current["Image"].As<string>(),
                    Link = resultTVShows.Current["Link"].As<string>()
                };

                tvShows.Add(tvShow);
            }

            return Ok(tvShows);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }



}