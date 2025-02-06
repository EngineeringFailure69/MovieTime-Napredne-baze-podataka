[ApiController]
[Route("[controller]")]
public class TestController : ControllerBase
{
    private readonly IDriver _neo4jDriver;

    public TestController(IDriver neo4jDriver)
    {
        _neo4jDriver = neo4jDriver;
    }


    [HttpGet("TestConnection")]
    public async Task<ActionResult> TestConnection()
    {
        try
        {
            using var session = _neo4jDriver.AsyncSession();
            var result = await session.RunAsync("RETURN 'Neo4j is up' AS response");
            var record = await result.SingleAsync();
            var response = record["response"].As<string>();
            return Ok(response);
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}