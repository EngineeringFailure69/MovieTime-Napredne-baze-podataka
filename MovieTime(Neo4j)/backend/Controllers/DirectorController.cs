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
            var query = @"
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

            var result = await session.RunAsync(query, parameters);
            return Ok($"Sucessfully updated director : {director.FirstName} {director.LastName}");           
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
}