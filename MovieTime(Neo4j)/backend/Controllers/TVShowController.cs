[ApiController]
[Route("[controller]")]
public class TVShowController : ControllerBase
{
    private readonly IDriver _neo4jDriver;

    public TVShowController(IDriver neo4jDriver)
    {
        _neo4jDriver = neo4jDriver;

    }

    [HttpPost("AddTVShow")]
    public async Task<ActionResult> AddTVShow([FromForm] TVShow tvShow , IFormFile image) {
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
            CREATE (ts:TVShow 
            { Name: $name, 
              YearOfRelease: $yearOfRelease, 
              Genre: $genre, 
              AvgScore: $avgScore,
              Description: $description,
              NumOfSeasons: $numOfSeasons,
              Image: $image
            })
            RETURN ts
            ";

            var parameters = new {
                name = tvShow.Name,
                yearOfRelease = tvShow.YearOfRelease,
                genre = tvShow.Genre,
                avgScore = tvShow.AvgScore,
                description = tvShow.Description,
                numOfSeasons = tvShow.NumOfSeasons,
                image = base64Image,
            };

            var result = await session.RunAsync(query, parameters);
            var record = await result.SingleAsync();
             return Ok($"TVShow {tvShow.Name} has been successfully added.");
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
            MATCH (ts:TVShow)
            RETURN ts.Name AS Name, 
                   ts.YearOfRelease AS YearOfRelease, 
                   ts.Genre AS Genre, 
                   ts.AvgScore AS AvgScore, 
                   ts.Description AS Description, 
                   ts.NumOfSeasons AS NumOfSeasons,
                   ts.Image as Image
            ";

            var tvShows = new List<TVShow>();

            var result = await session.RunAsync(query); // pokrece query
            await foreach(var record in result) 
            {
                var tvShow = new TVShow {
                    Name = record["Name"].As<string>(),
                    YearOfRelease = record["YearOfRelease"].As<int>(),
                    Genre = record["Genre"].As<string>(),
                    AvgScore = record["AvgScore"].As<double>(),
                    Description = record["Description"].As<string>(),
                    NumOfSeasons = record["NumOfSeasons"].As<int>(),
                    Image = record["Image"].As<string>(),
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

    [HttpDelete("DeleteTVShow/{Name}")]
    public async Task<ActionResult> DeleteTVShow(string Name) {
        try
        {
            await using var session = _neo4jDriver.AsyncSession();

            var query = @"
            MATCH (ts:TVShow) WHERE ts.Name=$name DETACH DELETE ts 
            ";

            var parameters = new { name = Name };
            var result = await session.RunAsync(query, parameters);
            var count = await result.ConsumeAsync();
            if(count.Counters.NodesDeleted == 0) 
            {
                return NotFound("TVShow not found");
            }
            return Ok("TVShow has been successfully deleted.");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("UpdateTVShow")]
    public async Task<ActionResult> UpdateTVShow([FromForm]TVShow tvShow , IFormFile image) {
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
            using var session = _neo4jDriver.AsyncSession();
            var query = @"
            MATCH (ts:TVShow {Name: $name})
            SET ts.YearOfRelease = $yearOfRelease, 
                ts.Genre = $genre, 
                ts.AvgScore = $avgScore,
                ts.Description = $description,
                ts.NumOfSeasons = $numOfSeasons,
                ts.Image = $image
            ";

            var parameters = new
            {
                name = tvShow.Name,
                yearOfRelease = tvShow.YearOfRelease,
                genre = tvShow.Genre,
                avgScore = tvShow.AvgScore,
                description = tvShow.Description,
                numOfSeasons = tvShow.NumOfSeasons,
                image = base64Image,
            };

            var result = await session.RunAsync(query, parameters);
            return Ok($"TVShow: {tvShow.Name} has been successfully updated.");
        }
        catch(Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}