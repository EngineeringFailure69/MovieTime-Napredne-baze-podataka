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
                   m.Link as Link,
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
    public async Task<ActionResult> UpdateMovie([FromForm]Movie movie , IFormFile image) {
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

            var result = await session.RunAsync(query, parameters);
            return Ok($"Movie: {movie.Name} has been successfully updated.");
        }
        catch(Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
}