using System.CodeDom.Compiler;

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
              Image: $image,
              Link: $link
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
                link = tvShow.Link,
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
                   ts.Image as Image,
                   ts.Link as Link
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
                    Link = record["Link"].As<string>(),
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
    [HttpGet("GetPageTVShows/{page}")]
    public async Task<ActionResult> GetPageTVShows(int page = 1)
    {
        try
        {
            if(page < 1)
                return BadRequest("page must be greater or equal to 1");
            int limitPage = 10;
            await using var session = _neo4jDriver.AsyncSession();

            var query = @"
            MATCH (ts:TVShow)
            RETURN ts.Name AS Name, 
                   ts.YearOfRelease AS YearOfRelease, 
                   ts.Genre AS Genre, 
                   ts.AvgScore AS AvgScore, 
                   ts.Description AS Description, 
                   ts.NumOfSeasons AS NumOfSeasons,
                   ts.Image as Image,
                   ts.Link as Link
            SKIP $skip
            LIMIT $limit
            ";

            var tvShows = new List<TVShow>();

            var result = await session.RunAsync(query , new {skip = (page-1)*limitPage , limit = limitPage}); // pokrece query
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
                    Link = record["Link"].As<string>(),
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
                ts.Image = $image,
                ts.Link = $link
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
                link = tvShow.Link,
            };

            var result = await session.RunAsync(query, parameters);
            return Ok($"TVShow: {tvShow.Name} has been successfully updated.");
        }
        catch(Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("GetTVShowAlphabeticalOrder/{asc}/{page}")]
    public async Task<ActionResult> GetTVShowAlphabeticalOrder(bool asc , int page)
    {
        try
        {
             if(page < 1)
                return BadRequest("Page must be greated than 0");
            await using var session = _neo4jDriver.AsyncSession();
            int limitPage = 10;
            string order = asc ? "ASC" : "DESC";
            var query = $@"
            MATCH (ts:TVShow)
            RETURN ts.Name AS Name, 
                   ts.YearOfRelease AS YearOfRelease, 
                   ts.Genre AS Genre, 
                   ts.AvgScore AS AvgScore, 
                   ts.Description AS Description, 
                   ts.NumOfSeasons AS NumOfSeasons,
                   ts.Image as Image,
                   ts.Link as Link
            ORDER BY ts.Name {order}
            SKIP $skip
            LIMIT $limit";

            var tvShows = new List<TVShow>();

            var result = await session.RunAsync(query , new {skip = (page-1)*limitPage , limit = limitPage});
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
                    Link = record["Link"].As<string>(),
                };

                tvShows.Add(tvShow);
            }
            return Ok(tvShows); 
        }
        catch(Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [HttpGet("GetTVShowYearOrder/{latest}/{page}")]
    public async Task<ActionResult> GetTVShowYearOrder(bool latest , int page)
    {
        try
        {
             if(page < 1)
                return BadRequest("Page must be greated than 0");
            await using var session = _neo4jDriver.AsyncSession();
            int limitPage = 10;
            string order = latest ? "DESC" : "ASC";
            var query = $@"
            MATCH (ts:TVShow)
            RETURN ts.Name AS Name, 
                   ts.YearOfRelease AS YearOfRelease, 
                   ts.Genre AS Genre, 
                   ts.AvgScore AS AvgScore, 
                   ts.Description AS Description, 
                   ts.NumOfSeasons AS NumOfSeasons,
                   ts.Image as Image,
                   ts.Link as Link
            ORDER BY ts.YearOfRelease {order}
            SKIP $skip
            LIMIT $limit";

            var tvShows = new List<TVShow>();

            var result = await session.RunAsync(query , new {skip = (page-1)*limitPage , limit = limitPage});
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
                    Link = record["Link"].As<string>(),
                };

                tvShows.Add(tvShow);
            }
            return Ok(tvShows); 
        }
        catch(Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("GetTVShowWithGenre/{genreShow}/{page}")]
    public async Task<ActionResult> GetTVShowWithGenre(string genreShow , int page)
    {
        try
        {
            if(page < 1)
                return BadRequest("Page must be greated than 0");
            await using var session = _neo4jDriver.AsyncSession();
            int limitPage = 10;
            var query = $@"
            MATCH (ts:TVShow)
            WHERE ts.Genre = $genre
            RETURN ts.Name AS Name, 
                   ts.YearOfRelease AS YearOfRelease, 
                   ts.Genre AS Genre, 
                   ts.AvgScore AS AvgScore, 
                   ts.Description AS Description, 
                   ts.NumOfSeasons AS NumOfSeasons,
                   ts.Image as Image,
                   ts.Link as Link
            SKIP $skip
            LIMIT $limit";

            var tvShows = new List<TVShow>();

            var result = await session.RunAsync(query , new {skip = (page-1)*limitPage , limit = limitPage , genre = genreShow});
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
                    Link = record["Link"].As<string>(),
                };

                tvShows.Add(tvShow);
            }
            return Ok(tvShows); 
        }
        catch(Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }
    [HttpGet("GetTVShowSearch/{search}/{page}")]
    public async Task<ActionResult> GetTVShowSearch(string search , int page)
    {
        try
        {
             if(page < 1)
                return BadRequest("Page must be greated than 0");
            await using var session = _neo4jDriver.AsyncSession();
            int limitPage = 10;
            var query = $@"
            MATCH (ts:TVShow)
            WHERE ts.Name STARTS WITH $name
            RETURN ts.Name AS Name, 
                   ts.YearOfRelease AS YearOfRelease, 
                   ts.Genre AS Genre, 
                   ts.AvgScore AS AvgScore, 
                   ts.Description AS Description, 
                   ts.NumOfSeasons AS NumOfSeasons,
                   ts.Image as Image,
                   ts.Link as Link
            SKIP $skip
            LIMIT $limit";

            var tvShows = new List<TVShow>();

            var result = await session.RunAsync(query , new {skip = (page-1)*limitPage , limit = limitPage , name = search});
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
                    Link = record["Link"].As<string>(),
                };

                tvShows.Add(tvShow);
            }
            return Ok(tvShows); 
        }
        catch(Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    //Funckija za ocenu serije, promeni ako treba nesto drugo da se uradi
    [HttpPost("ChangeTVShowAvgScore/{showName}/{avgScore}")]
    public async Task<ActionResult> ChangeTVShowAvgScore(string showName, double avgScore)
    {
        try
        {
            
            await using var session = _neo4jDriver.AsyncSession();
            var query = @"
                    MATCH (ts:TVShow {Name: $showName})
                    SET ts.AvgScore = $avgScore
            ";

            await session.RunAsync(query, new {
                showName, 
                avgScore
            });

            return Ok("Average Score of the TV show was successfully changed");
        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}