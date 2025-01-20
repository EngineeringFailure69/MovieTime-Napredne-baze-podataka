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
            var query = @"
            MATCH (a:Actor {FirstName: $firstName, LastName: $lastName})
            SET a.DateOfBirth = $dateOfBirth, a.Awards = $awards
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
            return Ok($"Sucessfully updated actor : {actor.FirstName} {actor.LastName}");           
        }
        catch(Exception ex)
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

            var query = @"
                MATCH(a:Actor{FirstName: $actorFirstName, LastName: $actorLastName})
                MATCH(m:Movie{Name: $movieName})
                CREATE (a)-[:ACTED_IN {RoleType: $roleType}]->(m)
            ";

            await session.RunAsync(query, new {
                actorFirstName, 
                actorLastName, 
                movieName, 
                roleType
            });

            return Ok("Actor has been successfully connected to the movie");
        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}