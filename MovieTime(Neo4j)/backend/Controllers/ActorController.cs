[ApiController]
[Route("[controller]")]
public class ActorController : ControllerBase
{
    private readonly IDriver _neo4jDriver;

    public ActorController(IDriver neo4jDriver)
    {
        _neo4jDriver = neo4jDriver;
    }

    [HttpPost("AddActor")]
    public async Task<ActionResult> AddActor([FromBody] Actor actor)
    {
        try
        {
            using var session = _neo4jDriver.AsyncSession();

            var query = @"
                CREATE (a:Actor {FirstName: $firstName, LastName: $lastName, DateOfBirth: $dateOfBirth, Awards: $awards})
                RETURN a
            ";

            
            var parameters = new
            {
                firstName = actor.FirstName,
                lastName = actor.LastName,
                dateOfBirth = actor.DateOfBirth.ToString("yyyy-MM-dd"), 
                awards = actor.Awards 
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
        var actors = new List<Actor>();        
        using var session = _neo4jDriver.AsyncSession();

        
        var query = @"
            MATCH (a:Actor)
            RETURN a.FirstName AS FirstName, a.LastName AS LastName, a.DateOfBirth AS DateOfBirth, a.Awards AS Awards
        ";

        var result = await session.RunAsync(query);
        await foreach (var record in result)
        {
            var actor = new Actor
            {
                FirstName = record["FirstName"].As<string>(),
                LastName = record["LastName"].As<string>(),
                DateOfBirth = record["DateOfBirth"].As<DateTime>(),
                Awards = record["Awards"].As<List<string>>()
            };
            actors.Add(actor);
        }
        return Ok(actors);

        }
        catch(Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [HttpPut("UpdateActor")]
    public async Task<ActionResult> UpdateActor([FromBody] Actor actor)
    {
        try
        {
            using var session = _neo4jDriver.AsyncSession();
            
            
            var checkQuery = @"
            MATCH (a:Actor {FirstName: $firstName, LastName: $lastName})
            RETURN a";
            
            var parameters = new
            {
                firstName = actor.FirstName,
                lastName = actor.LastName
            };

            var existingActorResult = await session.RunAsync(checkQuery, parameters);

            if (!await existingActorResult.FetchAsync())
            {
                return NotFound($"Actor {actor.FirstName} {actor.LastName} does not exist.");
            }

            
            var updateQuery = @"
            MATCH (a:Actor {FirstName: $firstName, LastName: $lastName})
            SET a.DateOfBirth = $dateOfBirth, a.Awards = $awards
            RETURN a";

            var updateParameters = new
            {
                firstName = actor.FirstName,
                lastName = actor.LastName,
                dateOfBirth = actor.DateOfBirth.ToString("yyyy-MM-dd"),
                awards = actor.Awards
            };

            var result = await session.RunAsync(updateQuery, updateParameters);

            return Ok($"Successfully updated actor: {actor.FirstName} {actor.LastName}");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpDelete("DeleteActor/{FirstName}/{LastName}")]
    public async Task<ActionResult> DeleteActor(string FirstName , string LastName) {
        try
        {
            await using var session = _neo4jDriver.AsyncSession();

            var query = @"
            MATCH (a:Actor {FirstName: $firstName, LastName: $lastName})
            DETACH DELETE a
            ";

            var parameters = new { firstName = FirstName , lastName = LastName };
            var result = await session.RunAsync(query, parameters);
            var count = await result.ConsumeAsync();
            if(count.Counters.NodesDeleted == 0) 
            {
                return NotFound("Actor not found");
            }
            return Ok("Actor has been successfully deleted.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [HttpPost("LinkActorToMovie/{actorFirstName}/{actorLastName}/{movieName}/{roleType}")]
    public async Task<ActionResult> LinkActorToMovie(string actorFirstName, string actorLastName, string movieName, string roleType)
    {
        try
        {
            await using var session = _neo4jDriver.AsyncSession();

            
            var actorCheckQuery = @"
                MATCH (a:Actor {FirstName: $actorFirstName, LastName: $actorLastName})
                RETURN a";
            var actorResult = await session.RunAsync(actorCheckQuery, new { actorFirstName, actorLastName });
            if (!await actorResult.FetchAsync())
            {
                return NotFound($"Actor {actorFirstName} {actorLastName} does not exist.");
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
                MATCH (a:Actor {FirstName: $actorFirstName, LastName: $actorLastName})
                MATCH (m:Movie {Name: $movieName})
                CREATE (a)-[:ACTED_IN {RoleType: $roleType}]->(m)";
            await session.RunAsync(linkQuery, new
            {
                actorFirstName,
                actorLastName,
                movieName,
                roleType
            });

            return Ok("Actor has been successfully linked to the movie.");
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }


    [HttpPost("LinkActorToTVShow/{actorFirstName}/{actorLastName}/{showName}/{roleType}")]
    public async Task<ActionResult> LinkActorToTVShow(string actorFirstName, string actorLastName, string showName, string roleType)
    {
        try
        {
            await using var session = _neo4jDriver.AsyncSession();

            
            var actorCheckQuery = @"
                MATCH (a:Actor {FirstName: $actorFirstName, LastName: $actorLastName})
                RETURN a";
            var actorResult = await session.RunAsync(actorCheckQuery, new { actorFirstName, actorLastName });
            if (!await actorResult.FetchAsync())
            {
                return NotFound($"Actor {actorFirstName} {actorLastName} does not exist.");
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
                MATCH (a:Actor {FirstName: $actorFirstName, LastName: $actorLastName})
                MATCH (ts:TVShow {Name: $showName})
                CREATE (a)-[:ACTED_IN {RoleType: $roleType}]->(ts)";
            await session.RunAsync(linkQuery, new
            {
                actorFirstName,
                actorLastName,
                showName,
                roleType
            });

            return Ok("Actor has been successfully linked to the TV show.");
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpGet("GetActorsFromMovie/{movieName}")]
    public async Task<ActionResult> GetActorsFromMovie(string movieName)
    {
        try
        {
            using var session = _neo4jDriver.AsyncSession();

            
            var movieCheckQuery = @"
                MATCH (m:Movie {Name: $movieName})
                RETURN m";
            var movieResult = await session.RunAsync(movieCheckQuery, new { movieName });
            if (!await movieResult.FetchAsync())
            {
                return NotFound($"Movie with the name {movieName} does not exist.");
            }

            
            var query = @"
                MATCH (:Movie {Name: $movieName})<-[:ACTED_IN]-(actor:Actor)
                RETURN actor.FirstName AS FirstName, 
                    actor.LastName AS LastName, 
                    actor.DateOfBirth AS DateOfBirth, 
                    actor.Awards AS Awards";

            var result = await session.RunAsync(query, new { movieName });

            var actors = new List<Actor>();
            while (await result.FetchAsync())
            {
                Actor actor = new Actor
                {
                    FirstName = result.Current["FirstName"].As<string>(),
                    LastName = result.Current["LastName"].As<string>(),
                    DateOfBirth = DateTime.Parse(result.Current["DateOfBirth"].As<string>()),
                    Awards = result.Current["Awards"].As<List<string>>()
                };

                actors.Add(actor);
            }

            return Ok(actors);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }


   [HttpGet("GetActorsFromTVShow/{showName}")]
    public async Task<ActionResult> GetActorsFromTVShow(string showName)
    {
        try
        {
            using var session = _neo4jDriver.AsyncSession();

           
            var showCheckQuery = @"
                MATCH (ts:TVShow {Name: $showName})
                RETURN ts";
            var showResult = await session.RunAsync(showCheckQuery, new { showName });
            if (!await showResult.FetchAsync())
            {
                return NotFound($"TV show with the name {showName} does not exist.");
            }

            
            var query = @"
                MATCH (:TVShow {Name: $showName})<-[:ACTED_IN]-(actor:Actor)
                RETURN actor.FirstName AS FirstName, 
                    actor.LastName AS LastName, 
                    actor.DateOfBirth AS DateOfBirth, 
                    actor.Awards AS Awards";

            var result = await session.RunAsync(query, new { showName });

            var actors = new List<Actor>();
            while (await result.FetchAsync())
            {
                Actor actor = new Actor
                {
                    FirstName = result.Current["FirstName"].As<string>(),
                    LastName = result.Current["LastName"].As<string>(),
                    DateOfBirth = DateTime.Parse(result.Current["DateOfBirth"].As<string>()),
                    Awards = result.Current["Awards"].As<List<string>>()
                };

                actors.Add(actor);
            }

            return Ok(actors);
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
        var actors = new List<object>();        
        using var session = _neo4jDriver.AsyncSession();

        
        var query = @"
            MATCH (a:Actor)
            RETURN a.FirstName AS FirstName, a.LastName AS LastName
        ";

        var result = await session.RunAsync(query);
        await foreach (var record in result)
        {
            var actor = new 
            {
                FirstName = record["FirstName"].As<string>(),
                LastName = record["LastName"].As<string>(),
            };
            actors.Add(actor);
        }
        return Ok(actors);

        }
        catch(Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}