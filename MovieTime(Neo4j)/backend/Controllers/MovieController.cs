[ApiController]
[Route("[controller]")]
public class MovieController : ControllerBase
{
    private readonly IDriver _neo4jDriver;

    public MovieController(IDriver neo4jDriver)
    {
        _neo4jDriver = neo4jDriver;

    }

    [HttpPost("AddMovie")]

    public async Task<ActionResult> AddMovie([FromForm] Movie movie , IFormFile image) {
        try
        {
            if(image == null || image.Length == 0)
            {
                return BadRequest("Image not found");
            }
            byte[] fileBytes;
            using (var stream = image.OpenReadStream())
            {
                fileBytes = new byte[image.Length];
                await stream.ReadAsync(fileBytes, 0, (int)image.Length);
            }
            string base64Image = Convert.ToBase64String(fileBytes);
            await using var session = _neo4jDriver.AsyncSession();

            var query = @"
            CREATE (m:Movie 
            { Name: $name, 
              YearOfRelease: $yearOfRelease, 
              Genre: $genre, 
              AvgScore: $avgScore,
              Description: $description,
              Duration: $duration,
              Image: $image,
              Link: $link
            })
            RETURN m
            ";

            var parameters = new {
                name = movie.Name,
                yearOfRelease = movie.YearOfRelease,
                genre = movie.Genre,
                avgScore = movie.AvgScore,
                description = movie.Description,
                duration = movie.Duration,
                image = base64Image,
                link = movie.Link,
            };

            var result = await session.RunAsync(query, parameters);
            var record = await result.SingleAsync();
            return Ok($"Movie {movie.Name} has been successfully added. {movie.Image}");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("GetAll")]
    public async Task<ActionResult> GetAll() {
        try
        {
            await using var session = _neo4jDriver.AsyncSession();

            var query = @"
            MATCH (m:Movie)
            RETURN m.Name AS Name, 
                   m.YearOfRelease AS YearOfRelease, 
                   m.Genre AS Genre, 
                   m.AvgScore AS AvgScore, 
                   m.Description AS Description, 
                   m.Duration AS Duration,
                   m.Image as Image,
                   m.Link as Link
            ";

            var movies = new List<Movie>();

            var result = await session.RunAsync(query); // pokrece query
            await foreach(var record in result) 
            {
                var movie = new Movie {
                    Name = record["Name"].As<string>(),
                    YearOfRelease = record["YearOfRelease"].As<int>(),
                    Genre = record["Genre"].As<string>(),
                    AvgScore = record["AvgScore"].As<double>(),
                    Description = record["Description"].As<string>(),
                    Duration = record["Duration"].As<int>(),
                    Image = record["Image"].As<string>(),
                    Link = record["Link"].As<string>(),
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

     [HttpGet("GetPageMovies/{page}")]
    public async Task<ActionResult> GetPageMovies(int page = 1)
    {
        try
        { 
            if(page < 1)
                return BadRequest("Page must be greated than 0");
            await using var session = _neo4jDriver.AsyncSession();
            int limitPage = 10;
            var query = @"
            MATCH (m:Movie)
            RETURN m.Name AS Name, 
                   m.YearOfRelease AS YearOfRelease, 
                   m.Genre AS Genre, 
                   m.AvgScore AS AvgScore, 
                   m.Description AS Description, 
                   m.Duration AS Duration,
                   m.Image as Image,
                   m.Link as Link
            SKIP $skip
            LIMIT $limit";

            var movies = new List<Movie>();

            var result = await session.RunAsync(query , new {skip = (page-1)*limitPage , limit = limitPage});
            await foreach(var record in result) 
            {
                var movie = new Movie {
                    Name = record["Name"].As<string>(),
                    YearOfRelease = record["YearOfRelease"].As<int>(),
                    Genre = record["Genre"].As<string>(),
                    AvgScore = record["AvgScore"].As<double>(),
                    Description = record["Description"].As<string>(),
                    Duration = record["Duration"].As<int>(),
                    Image = record["Image"].As<string>(),
                    Link = record["Link"].As<string>(),
                };

                movies.Add(movie);
            }
            return Ok(movies); 
        }
        catch(Exception ex)
        {
            return BadRequest(ex.Message);
        }
    } 

    [HttpDelete("DeleteMovie/{Name}")]
    public async Task<ActionResult> DeleteMovie(string Name) {
        try
        {
            await using var session = _neo4jDriver.AsyncSession();

            var query = @"
            MATCH (m:Movie) WHERE m.Name=$name DETACH DELETE m 
            ";

            var parameters = new { name = Name };
            var result = await session.RunAsync(query, parameters);
            var count = await result.ConsumeAsync();
            if(count.Counters.NodesDeleted == 0) 
            {
                return NotFound("Movie not found");
            }
            return Ok("Movie has been successfully deleted.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

   [HttpPut("UpdateMovie")]
    public async Task<ActionResult> UpdateMovie([FromForm] Movie movie, IFormFile image)
    {
        try
        {
            using var session = _neo4jDriver.AsyncSession();
            var checkMovieQuery = @"
                MATCH (m:Movie {Name: $name})
                RETURN m
            ";

            var movieResult = await session.RunAsync(checkMovieQuery, new { name = movie.Name });

            if (!await movieResult.FetchAsync())
            {
                return NotFound("Movie does not exist.");
            }

            if (image == null || image.Length == 0)
            {
                return BadRequest("Image not found");
            }

            byte[] fileBytes;
            using (var stream = image.OpenReadStream())
            {
                fileBytes = new byte[image.Length];
                await stream.ReadAsync(fileBytes, 0, (int)image.Length);
            }

            string base64Image = Convert.ToBase64String(fileBytes);

            var query = @"
                MATCH (m:Movie {Name: $name})
                SET m.YearOfRelease = $yearOfRelease, 
                    m.Genre = $genre, 
                    m.AvgScore = $avgScore,
                    m.Description = $description,
                    m.Duration = $duration,
                    m.Image = $image,
                    m.Link = $link
            ";

            var parameters = new
            {
                name = movie.Name,
                yearOfRelease = movie.YearOfRelease,
                genre = movie.Genre,
                avgScore = movie.AvgScore,
                description = movie.Description,
                duration = movie.Duration,
                image = base64Image,
                link = movie.Link,
            };

            await session.RunAsync(query, parameters);

            return Ok($"Movie: {movie.Name} has been successfully updated.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }


    [HttpGet("GetMoviesAlphabeticalOrder/{asc}/{page}")]
    public async Task<ActionResult> GetMoviesAlphabeticalOrder(bool asc , int page)
    {
        try
        {
             if(page < 1)
                return BadRequest("Page must be greated than 0");
            await using var session = _neo4jDriver.AsyncSession();
            int limitPage = 10;
            string order = asc ? "ASC" : "DESC";
            var query = $@"
            MATCH (m:Movie)
            RETURN m.Name AS Name, 
                   m.YearOfRelease AS YearOfRelease, 
                   m.Genre AS Genre, 
                   m.AvgScore AS AvgScore, 
                   m.Description AS Description, 
                   m.Duration AS Duration,
                   m.Image as Image,
                   m.Link as Link
            ORDER BY m.Name {order}
            SKIP $skip
            LIMIT $limit";

            var movies = new List<Movie>();

            var result = await session.RunAsync(query , new {skip = (page-1)*limitPage , limit = limitPage});
            await foreach(var record in result) 
            {
                var movie = new Movie {
                    Name = record["Name"].As<string>(),
                    YearOfRelease = record["YearOfRelease"].As<int>(),
                    Genre = record["Genre"].As<string>(),
                    AvgScore = record["AvgScore"].As<double>(),
                    Description = record["Description"].As<string>(),
                    Duration = record["Duration"].As<int>(),
                    Image = record["Image"].As<string>(),
                    Link = record["Link"].As<string>(),
                };

                movies.Add(movie);
            }
            return Ok(movies); 
        }
        catch(Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

  [HttpGet("GetMoviesYearOrder/{latest}/{page}")]
    public async Task<ActionResult> GetMoviesYearOrder(bool latest , int page)
    {
        try
        {
             if(page < 1)
                return BadRequest("Page must be greated than 0");
            await using var session = _neo4jDriver.AsyncSession();
            int limitPage = 10;
            string order = latest ? "DESC" : "ASC";
            var query = $@"
            MATCH (m:Movie)
            RETURN m.Name AS Name, 
                   m.YearOfRelease AS YearOfRelease, 
                   m.Genre AS Genre, 
                   m.AvgScore AS AvgScore, 
                   m.Description AS Description, 
                   m.Duration AS Duration,
                   m.Image as Image,
                   m.Link as Link
            ORDER BY m.YearOfRelease {order}
            SKIP $skip
            LIMIT $limit";

            var movies = new List<Movie>();

            var result = await session.RunAsync(query , new {skip = (page-1)*limitPage , limit = limitPage});
            await foreach(var record in result) 
            {
                var movie = new Movie {
                    Name = record["Name"].As<string>(),
                    YearOfRelease = record["YearOfRelease"].As<int>(),
                    Genre = record["Genre"].As<string>(),
                    AvgScore = record["AvgScore"].As<double>(),
                    Description = record["Description"].As<string>(),
                    Duration = record["Duration"].As<int>(),
                    Image = record["Image"].As<string>(),
                    Link = record["Link"].As<string>(),
                };

                movies.Add(movie);
            }
            return Ok(movies); 
        }
        catch(Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [HttpGet("GetMoviesWithGenre/{genreMovie}/{page}")]
    public async Task<ActionResult> GetMoviesWithGenre(string genreMovie , int page)
    {
        try
        {
            if(page < 1)
                return BadRequest("Page must be greated than 0");
            await using var session = _neo4jDriver.AsyncSession();
            int limitPage = 10;
            var query = $@"
            MATCH (m:Movie)
            WHERE m.Genre = $genre
            RETURN m.Name AS Name, 
                   m.YearOfRelease AS YearOfRelease, 
                   m.Genre AS Genre, 
                   m.AvgScore AS AvgScore, 
                   m.Description AS Description, 
                   m.Duration AS Duration,
                   m.Image as Image,
                   m.Link as Link
            SKIP $skip
            LIMIT $limit";

            var movies = new List<Movie>();

            var result = await session.RunAsync(query , new {skip = (page-1)*limitPage , limit = limitPage , genre = genreMovie});
            await foreach(var record in result) 
            {
                var movie = new Movie {
                    Name = record["Name"].As<string>(),
                    YearOfRelease = record["YearOfRelease"].As<int>(),
                    Genre = record["Genre"].As<string>(),
                    AvgScore = record["AvgScore"].As<double>(),
                    Description = record["Description"].As<string>(),
                    Duration = record["Duration"].As<int>(),
                    Image = record["Image"].As<string>(),
                    Link = record["Link"].As<string>(),
                };

                movies.Add(movie);
            }
            return Ok(movies); 
        }
        catch(Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [HttpGet("GetMoviesSearch/{search}/{page}")]
    public async Task<ActionResult> GetMoviesSearch(string search , int page)
    {
        try
        {
            if(page < 1)
                return BadRequest("Page must be greated than 0");
            await using var session = _neo4jDriver.AsyncSession();
            int limitPage = 10;
            var query = $@"
            MATCH (m:Movie)
            WHERE TOLOWER(m.Name) STARTS WITH TOLOWER($name)
            RETURN m.Name AS Name, 
                   m.YearOfRelease AS YearOfRelease, 
                   m.Genre AS Genre, 
                   m.AvgScore AS AvgScore, 
                   m.Description AS Description, 
                   m.Duration AS Duration,
                   m.Image as Image,
                   m.Link as Link
            SKIP $skip
            LIMIT $limit";

            var movies = new List<Movie>();

            var result = await session.RunAsync(query , new {skip = (page-1)*limitPage , limit = limitPage , name = search});
            await foreach(var record in result) 
            {
                var movie = new Movie {
                    Name = record["Name"].As<string>(),
                    YearOfRelease = record["YearOfRelease"].As<int>(),
                    Genre = record["Genre"].As<string>(),
                    AvgScore = record["AvgScore"].As<double>(),
                    Description = record["Description"].As<string>(),
                    Duration = record["Duration"].As<int>(),
                    Image = record["Image"].As<string>(),
                    Link = record["Link"].As<string>(),
                };

                movies.Add(movie);
            }
            return Ok(movies); 
        }
        catch(Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    //Funckija za ocenu filma, promeni ako treba nesto drugo da se uradi
    [HttpPost("ChangeMovieAvgScore/{movieName}/{avgScore}")]
    public async Task<ActionResult> ChangeMovieAvgScore(string movieName, double avgScore)
    {
        try
        {
            
            await using var session = _neo4jDriver.AsyncSession();
            var query = @"
                    MATCH (m:Movie {Name: $movieName})
                    SET m.AvgScore = $avgScore
            ";

            await session.RunAsync(query, new {
                movieName, 
                avgScore
            });

            return Ok("Average Score of the movie was successfully changed");
        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    [HttpGet("GetMoviesFilter")]
    public async Task<ActionResult> GetMoviesFilter([FromQuery] FilterRequest filterRequest)
    {
        try
        {
            if(filterRequest.Page < 1)
                return BadRequest("Invalid page");
            int limit = 10;
            await using var session = _neo4jDriver.AsyncSession();

            var queryBuilder = new StringBuilder(@"
                MATCH (m:Movie)");

            var whereClauses = new List<string>();
            var whereClausesEdges = new List<string>();
            var parameters = new Dictionary<string, object>();

            if (!string.IsNullOrEmpty(filterRequest.Genre))
            {
                whereClauses.Add("m.Genre = $genre");
                parameters["genre"] = filterRequest.Genre;
            }

            if (filterRequest.YearOfRelease.HasValue)
            {
                whereClauses.Add("m.YearOfRelease = $yearOfRelease");
                parameters["yearOfRelease"] = filterRequest.YearOfRelease.Value;
            }

            if (filterRequest.Grade.HasValue && filterRequest.Grade >= 0 && filterRequest.Grade <= 10)
            {
                whereClauses.Add("m.AvgScore >= $grade");
                parameters["grade"] = filterRequest.Grade.Value;
            }

            if (!string.IsNullOrEmpty(filterRequest.ActorFirstName) && !string.IsNullOrEmpty(filterRequest.ActorLastName))
            {
                whereClausesEdges.Add("a.FirstName = $actorFirstName AND a.LastName = $actorLastName");
                parameters["actorFirstName"] = filterRequest.ActorFirstName;
                parameters["actorLastName"] = filterRequest.ActorLastName;
            }

            if (!string.IsNullOrEmpty(filterRequest.DirectorFirstName) && !string.IsNullOrEmpty(filterRequest.DirectorLastName))
            {
                whereClausesEdges.Add("d.FirstName = $directorFirstName AND d.LastName = $directorLastName");
                parameters["directorFirstName"] = filterRequest.DirectorFirstName;
                parameters["directorLastName"] = filterRequest.DirectorLastName;
            }

            
            if (whereClauses.Count > 0)
            {
                queryBuilder.Append(" WHERE " + string.Join(" AND ", whereClauses));
            }

            
            queryBuilder.Append(@"
                OPTIONAL MATCH (m)<-[:ACTED_IN]-(a:Actor)
                OPTIONAL MATCH (m)<-[:DIRECTED_IN]-(d:Director)");

            queryBuilder.Append(@"
                WITH m, a, d
            ");

            if (whereClausesEdges.Count > 0)
            {
                queryBuilder.Append(" WHERE " + string.Join(" AND ", whereClausesEdges));
            }

            queryBuilder.Append(@"
                RETURN m.Name AS Name, 
                    m.YearOfRelease AS YearOfRelease, 
                    m.Genre AS Genre, 
                    m.AvgScore AS AvgScore, 
                    m.Description AS Description, 
                    m.Duration AS Duration,
                    m.Image as Image,
                    m.Link as Link
                    SKIP $skip
                    LIMIT $limit");

            var query = queryBuilder.ToString();
            parameters["skip"] =  (filterRequest.Page-1)*limit;
            parameters["limit"] = limit;
            var movies = new List<Movie>();
            var result = await session.RunAsync(query, parameters);

            await foreach (var record in result)
            {
                var movie = new Movie
                {
                    Name = record["Name"].As<string>(),
                    YearOfRelease = record["YearOfRelease"].As<int>(),
                    Genre = record["Genre"].As<string>(),
                    AvgScore = record["AvgScore"].As<double>(),
                    Description = record["Description"].As<string>(),
                    Duration = record["Duration"].As<int>(),
                    Image = record["Image"].As<string>(),
                    Link = record["Link"].As<string>(),
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
    [HttpGet("GetMoviesWithActor/{actorFirstName}/{actorLastName}")]
    public async Task<ActionResult> GetMoviesWithActors(string actorFirstName, string actorLastName)
    {
        try
        {
            using var session = _neo4jDriver.AsyncSession();

            var checkActorQuery = @"
                MATCH (a:Actor {FirstName: $actorFirstName, LastName: $actorLastName})
                RETURN a
            ";

            var actorResult = await session.RunAsync(checkActorQuery, new { actorFirstName, actorLastName });

            if (!await actorResult.FetchAsync())
            {
                return NotFound("Actor does not exist.");
            }

            var query = @"
                MATCH (:Actor {FirstName: $actorFirstName, LastName: $actorLastName})-[:ACTED_IN]->(movie:Movie)
                RETURN movie.Duration AS Duration, movie.Name AS Name, movie.YearOfRelease AS YearOfRelease, movie.Genre AS Genre,
                    movie.AvgScore as AvgScore, movie.Description as Description, movie.Image as Image, movie.Link as Link
            ";

            var result = await session.RunAsync(query, new {
                actorFirstName,
                actorLastName
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
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

  [HttpGet("GetMoviesWithDirector/{directorFirstName}/{directorLastName}")]
    public async Task<ActionResult> GetMoviesWithDirector(string directorFirstName, string directorLastName)
    {
        try
        {
            using var session = _neo4jDriver.AsyncSession();

            var checkDirectorQuery = @"
                MATCH (d:Director {FirstName: $directorFirstName, LastName: $directorLastName})
                RETURN d
            ";

            var directorResult = await session.RunAsync(checkDirectorQuery, new { directorFirstName, directorLastName });

            if (!await directorResult.FetchAsync())
            {
                return NotFound("Director does not exist.");
            }

            var query = @"
                MATCH (:Director {FirstName: $directorFirstName, LastName: $directorLastName})-[:DIRECTED_IN]->(movie:Movie)
                RETURN movie.Duration AS Duration, movie.Name AS Name, movie.YearOfRelease AS YearOfRelease, movie.Genre AS Genre,
                    movie.AvgScore as AvgScore, movie.Description as Description, movie.Image as Image, movie.Link as Link
            ";

            var result = await session.RunAsync(query, new {
                directorFirstName,
                directorLastName
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
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }


    [HttpGet("GetAllUniqueGenres")]
    public async Task<ActionResult> GetAllUniqueGenres()
    {
        try
        {
            await using var session = _neo4jDriver.AsyncSession();        
            var query = @"
                MATCH (m:Movie)
                RETURN DISTINCT m.Genre AS Genre
            ";

            var genres = new List<string>();

            var result = await session.RunAsync(query);
            await foreach (var record in result)
            {
                var genre = record["Genre"].As<string>();
                genres.Add(genre);
            }

            return Ok(genres); 
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }



}