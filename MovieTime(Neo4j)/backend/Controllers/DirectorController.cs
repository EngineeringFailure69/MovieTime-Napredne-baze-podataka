[ApiController]
[Route("[controller]")]
public class DirectorController : ControllerBase
{
    private readonly IDriver _neo4jDriver;

    public DirectorController(IDriver neo4jDriver)
    {
        _neo4jDriver = neo4jDriver;
    }

    [HttpPost("AddDirector")]
    public async Task<ActionResult> AddDirector([FromBody] Director director)
    {
        try
        {
             using var session = _neo4jDriver.AsyncSession();

            var query = @"
                CREATE (d:Director {FirstName: $firstName, LastName: $lastName, DateOfBirth: $dateOfBirth, MoviesMade: $moviesMade})
                RETURN d
            ";

            
            var parameters = new
            {
                firstName = director.FirstName,
                lastName = director.LastName,
                dateOfBirth = director.DateOfBirth.ToString("yyyy-MM-dd"), 
                moviesMade = director.MoviesMade 
            };

            var result = await session.RunAsync(query, parameters);
            var record = await result.SingleAsync();
            return Ok(record);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("GetAll")]
    public async Task<ActionResult> GetAll()
    {
        try
        {
        var directors = new List<Director>();        
        using var session = _neo4jDriver.AsyncSession();

        
        var query = @"
            MATCH (d:Director)
            RETURN d.FirstName AS FirstName, d.LastName AS LastName, d.DateOfBirth AS DateOfBirth, d.MoviesMade AS MoviesMade";

        var result = await session.RunAsync(query);
        await foreach (var record in result)
        {
            var director = new Director
            {
                FirstName = record["FirstName"].As<string>(),
                LastName = record["LastName"].As<string>(),
                DateOfBirth = record["DateOfBirth"].As<DateTime>(),
                MoviesMade = record["MoviesMade"].As<int>()
            };
            directors.Add(director);
        }
        return Ok(directors);

        }
        catch(Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [HttpPut("UpdateDirector")]
    public async Task<ActionResult> UpdateDirector([FromBody] Director director)
    {
        try
        {
            using var session = _neo4jDriver.AsyncSession();

            
            var directorCheckQuery = @"
                MATCH (d:Director {FirstName: $firstName, LastName: $lastName})
                RETURN d";
            var directorCheckResult = await session.RunAsync(directorCheckQuery, new
            {
                firstName = director.FirstName,
                lastName = director.LastName
            });
            if (!await directorCheckResult.FetchAsync())
            {
                return NotFound($"Director {director.FirstName} {director.LastName} does not exist.");
            }

            
            var updateQuery = @"
                MATCH (d:Director {FirstName: $firstName, LastName: $lastName})
                SET d.DateOfBirth = $dateOfBirth, d.MoviesMade = $moviesMade
                RETURN d";
            var parameters = new
            {
                firstName = director.FirstName,
                lastName = director.LastName,
                dateOfBirth = director.DateOfBirth.ToString("yyyy-MM-dd"),
                moviesMade = director.MoviesMade
            };

            var result = await session.RunAsync(updateQuery, parameters);
            return Ok($"Successfully updated director: {director.FirstName} {director.LastName}");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("DeleteDirector/{FirstName}/{LastName}")]
    public async Task<ActionResult> DeleteDirector(string FirstName , string LastName) {
        try
        {
            await using var session = _neo4jDriver.AsyncSession();

            var query = @"
            MATCH (d:Director {FirstName: $firstName, LastName: $lastName})
            DETACH DELETE d";

            var parameters = new { firstName = FirstName , lastName = LastName };
            var result = await session.RunAsync(query, parameters);
            var count = await result.ConsumeAsync();
            if(count.Counters.NodesDeleted == 0) 
            {
                return NotFound("Director not found");
            }
            return Ok("Director has been successfully deleted.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    
   [HttpPost("LinkDirectorToMovie/{directorFirstName}/{directorLastName}/{movieName}")]
    public async Task<ActionResult> LinkDirectorToMovie(string directorFirstName, string directorLastName, string movieName)
    {
        try
        {
            await using var session = _neo4jDriver.AsyncSession();

            
            var directorCheckQuery = @"
                MATCH (d:Director {FirstName: $directorFirstName, LastName: $directorLastName})
                RETURN d";
            var directorResult = await session.RunAsync(directorCheckQuery, new
            {
                directorFirstName,
                directorLastName
            });
            if (!await directorResult.FetchAsync())
            {
                return NotFound($"Director {directorFirstName} {directorLastName} does not exist.");
            }

            
            var movieCheckQuery = @"
                MATCH (m:Movie {Name: $movieName})
                RETURN m";
            var movieResult = await session.RunAsync(movieCheckQuery, new { movieName });
            if (!await movieResult.FetchAsync())
            {
                return NotFound($"Movie with the name {movieName} does not exist.");
            }

            
            var linkQuery = @"
                MATCH (d:Director {FirstName: $directorFirstName, LastName: $directorLastName})
                MATCH (m:Movie {Name: $movieName})
                MERGE (d)-[:DIRECTED_IN]->(m)";
            await session.RunAsync(linkQuery, new
            {
                directorFirstName,
                directorLastName,
                movieName
            });

            return Ok("Director has been successfully connected to the movie.");
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }



    [HttpGet("GetAllName")]
    public async Task<ActionResult> GetAllName()
    {
        try
        {
        var directors = new List<object>();        
        using var session = _neo4jDriver.AsyncSession();

        
        var query = @"
            MATCH (d:Director)
            RETURN d.FirstName AS FirstName, d.LastName AS LastName
        ";

        var result = await session.RunAsync(query);
        await foreach (var record in result)
        {
            var director = new 
            {
                FirstName = record["FirstName"].As<string>(),
                LastName = record["LastName"].As<string>(),
            };
            directors.Add(director);
        }
        return Ok(directors);

        }
        catch(Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }



   [HttpPost("LinkDirectorToTVShow/{directorFirstName}/{directorLastName}/{showName}")]
    public async Task<ActionResult> LinkDirectorToTVShow(string directorFirstName, string directorLastName, string showName)
    {
        try
        {
            await using var session = _neo4jDriver.AsyncSession();

            
            var directorCheckQuery = @"
                MATCH (d:Director {FirstName: $directorFirstName, LastName: $directorLastName})
                RETURN d";
            var directorResult = await session.RunAsync(directorCheckQuery, new
            {
                directorFirstName,
                directorLastName
            });
            if (!await directorResult.FetchAsync())
            {
                return NotFound($"Director {directorFirstName} {directorLastName} does not exist.");
            }

            
            var showCheckQuery = @"
                MATCH (ts:TVShow {Name: $showName})
                RETURN ts";
            var showResult = await session.RunAsync(showCheckQuery, new { showName });
            if (!await showResult.FetchAsync())
            {
                return NotFound($"TV show with the name {showName} does not exist.");
            }

            
            var linkQuery = @"
                MATCH (d:Director {FirstName: $directorFirstName, LastName: $directorLastName})
                MATCH (ts:TVShow {Name: $showName})
                MERGE (d)-[:DIRECTED_IN]->(ts)";
            await session.RunAsync(linkQuery, new
            {
                directorFirstName,
                directorLastName,
                showName
            });

            return Ok("Director has been successfully connected to the TV show.");
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

}