[ApiController]
[Route("[controller]")]
public class UserController : ControllerBase
{
    private readonly IDriver _neo4jDriver;
    private readonly IConfiguration _configuration;

    public UserController(IDriver neo4jDriver , IConfiguration configuration)
    {
        _neo4jDriver = neo4jDriver;
        _configuration = configuration;
    }


    [HttpPost("Register")]
    public async Task<ActionResult> Register([FromBody]User user)
    {
        try
        {
            using var session = _neo4jDriver.AsyncSession();
            if(string.IsNullOrEmpty(user.FirstName) || user.FirstName.Length>30)
                return BadRequest("This field is required and it must be less than 30 characters");
            if(string.IsNullOrEmpty(user.LastName) || user.LastName.Length>30)
                return BadRequest("This field is required and it must be less than 30 characters");
            if(string.IsNullOrEmpty(user.Email) || !user.Email.EndsWith("@gmail.com") || user.Email.Length>80)
                return BadRequest("This field is required and it must end with @gmail.com and it must have maximum od 30 characters");
            if(string.IsNullOrEmpty(user.Password) || user.Password.Length < 10 || user.Password.Length > 30)
                return BadRequest("This field is required and its length must be between 10 and 30 characteds");
            if(string.IsNullOrEmpty(user.TypeOfUser) || (user.TypeOfUser!="user" && user.TypeOfUser!="admin") || user.TypeOfUser.Length>10)
                return BadRequest("This field is required and it must be user or admin");
            var query = @"
                CREATE (u:User {FirstName: $firstName, LastName: $lastName, Email: $email, Password: $password, TypeOfUser: $typeOfUser})
                RETURN u
            ";
            string passhash = BCrypt.Net.BCrypt.HashPassword(user.Password);
            var parameters = new 
            {
                firstName = user.FirstName, 
                lastName = user.LastName, 
                email = user.Email,
                password = passhash, 
                typeOfUser = user.TypeOfUser
            };

            var result = await session.RunAsync(query, parameters);
            var record = await result.SingleAsync();
            await session.CloseAsync();
            return Ok("Registration is succesful");
        }
        catch (Exception ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("Login/{email}/{password}")]
    public async Task<ActionResult> Login(string email, string password)
    {
        try
        {
            using var session = _neo4jDriver.AsyncSession();
            if(string.IsNullOrEmpty(email) || !email.EndsWith("@gmail.com"))
                return BadRequest("Field is required and it must end with @gmail.com");
            if(string.IsNullOrEmpty(password))
                return BadRequest("This field is required");
            var query = @"MATCH (u:User {Email: $email}) RETURN u.FirstName as FirstName , u.LastName as LastName, u.Password as hashedPassword, u.TypeOfUser as TypeOfUser";
            var hashedPassword = string.Empty;
            var FirstName = string.Empty;
            var LastName = string.Empty;
            var TypeOfUser = string.Empty;
            var result = await session.RunAsync(query, new { email });
            while (await result.FetchAsync())
            {
                FirstName = result.Current["FirstName"].As<string>();
                LastName = result.Current["LastName"].As<string>();
                TypeOfUser = result.Current["TypeOfUser"].As<string>();
                hashedPassword = result.Current["hashedPassword"].As<string>();
            }

            if (string.IsNullOrEmpty(FirstName))
                return NotFound("User does not exist");

            if (!BCrypt.Net.BCrypt.Verify(password, hashedPassword))
                return Unauthorized("Wrong password");
            
            User user = new User 
            {
                Email = email,
                FirstName = FirstName,
                LastName = LastName,
                TypeOfUser = TypeOfUser,
                Password = hashedPassword,
            };

            string token = CreateToken(user);

            return Ok(token);
        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }
    private string CreateToken(User user){
        List<Claim> claims = new List<Claim>(){
            new Claim("Email", user.Email),
            new Claim("FirstName", user.FirstName ),
            new Claim("LastName", user.LastName),
            new Claim("TypeOfUser" , user.TypeOfUser)
        };
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration.GetSection("AppSettings:Token").Value!));
        var cred = new SigningCredentials(key , SecurityAlgorithms.HmacSha512Signature);

        var token = new JwtSecurityToken(
            claims: claims,
            expires : DateTime.Now.AddHours(12),
            signingCredentials : cred
        );

        var jwt = new JwtSecurityTokenHandler().WriteToken(token);
        return jwt;
    }
    
    [HttpPost("AddFavoriteMovie/{movieName}/{userEmail}")]
    public async Task<ActionResult> AddFavoriteMovie(string movieName, string userEmail)
    {
        try
        {
            using var session = _neo4jDriver.AsyncSession();

           
            var checkQuery = @"
                MATCH (u:User {Email: $userEmail})-[r:FAVORITE]->(m:Movie {Name: $movieName})
                RETURN r
            ";

            var checkResult = await session.RunAsync(checkQuery, new
            {
                movieName,
                userEmail
            });

            if (await checkResult.FetchAsync())
            {
                return BadRequest("Movie is already marked as favorite");
            }

            var query = @"
                MATCH(m:Movie{Name: $movieName})
                MATCH(u:User{Email: $userEmail})
                MERGE (u)-[:FAVORITE]->(m)
            ";

            await session.RunAsync(query, new {
                movieName,
                userEmail
            });

            return Ok("Movie has been successfully added to the favorites");
        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpPost("AddFavoriteTVShow/{showName}/{userEmail}")]
    public async Task<ActionResult> AddFavoriteTVShow(string showName, string userEmail)
    {
        try
        {
            using var session = _neo4jDriver.AsyncSession();

            var checkQuery = @"
                MATCH (u:User {Email: $userEmail})-[r:FAVORITE]->(ts:TVShow {Name: $showName})
                RETURN r
            ";

            var checkResult = await session.RunAsync(checkQuery, new
            {
                showName,
                userEmail
            });

            if (await checkResult.FetchAsync())
            {
                return BadRequest("TVShow is already marked as favorite");
            }

            var query = @"
                MATCH(ts:TVShow{Name: $showName})
                MATCH(u:User{Email: $userEmail})
                MERGE (u)-[:FAVORITE]->(ts)
            ";

            await session.RunAsync(query, new {
                showName,
                userEmail
            });
            return Ok("TV show has been successfully added to the favorites");
        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpPost("RemoveFavoriteMovie/{movieName}/{userEmail}")]
    public async Task<ActionResult> RemoveFavoriteMovie(string movieName, string userEmail)
    {
        try
        {
            using var session = _neo4jDriver.AsyncSession();
            var query = @"
                MATCH(u:User{Email: $userEmail})-[f:FAVORITE]->(m:Movie{Name: $movieName})
                DELETE f
            ";

            await session.RunAsync(query, new {
                movieName,
                userEmail
            });

            return Ok("Movie has been successfully removed from the favorites");
        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpPost("RemoveFavoriteTVShow/{showName}/{userEmail}")]
    public async Task<ActionResult> RemoveFavoriteTVShow(string showName, string userEmail)
    {
        try
        {
            using var session = _neo4jDriver.AsyncSession();
            var query = @"
                MATCH(u:User{Email: $userEmail})-[f:FAVORITE]->(ts:TVShow{Name: $showName})
                DELETE f
            ";

            await session.RunAsync(query, new {
                showName,
                userEmail
            });

            return Ok("TV show has been successfully removed from the favorites");
        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpPost("RateMovie/{movieName}/{userEmail}/{score}/{feedback}")]
    public async Task<ActionResult> RateMovie(string movieName, string userEmail, double score, string feedback)
    {
        try
        {
            if (score < 0.0 || score > 10.0)
            {
                return BadRequest("Score must be between 0 and 10.");
            }

            using var session = _neo4jDriver.AsyncSession();


            var checkExistingRatingQuery = @"
            MATCH (u:User{Email: $userEmail})-[r:RATED]->(m:Movie{Name: $movieName})
            RETURN r
            ";

            var existingRating = await session.RunAsync(checkExistingRatingQuery, new { userEmail, movieName });

            
            if (await existingRating.FetchAsync())
            {
                return BadRequest("You have already rated this movie.");
            }
            var query = @"
                MATCH(m:Movie{Name: $movieName})
                MATCH(u:User{Email: $userEmail})
                CREATE (u)-[r:RATED]->(m)
                SET r.Score = $score, r.Feedback = $feedback
            ";

            await session.RunAsync(query, new {
                movieName,
                userEmail,
                score, 
                feedback
            });

            var updateAvgScoreQuery = @"
            MATCH (m:Movie {Name: $movieName})<-[r:RATED]-(u:User)
            WITH m, AVG(r.Score) AS averageScore
            SET m.AvgScore = averageScore
            ";

            await session.RunAsync(updateAvgScoreQuery, new
            {
                movieName
            });

            return Ok("Movie has been successfully rated");
        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpPost("RateTVShow/{TVShowName}/{userEmail}/{score}/{feedback}")]
    public async Task<ActionResult> RateTVShow(string TVShowName, string userEmail, double score, string feedback)
    {
        try
        {
            if (score < 0.0 || score > 10.0)
            {
                return BadRequest("Score must be between 0 and 10.");
            }

            

            using var session = _neo4jDriver.AsyncSession();

            var checkExistingRatingQuery = @"
            MATCH (u:User{Email: $userEmail})-[r:RATED]->(ts:TVShow{Name: $TVShowName})
            RETURN r
            ";

            var existingRating = await session.RunAsync(checkExistingRatingQuery, new { userEmail, TVShowName });

            
            if (await existingRating.FetchAsync())
            {
                return BadRequest("You have already rated this movie.");
            }
            

            var query = @"
                MATCH(ts:TVShow{Name: $TVShowName})
                MATCH(u:User{Email: $userEmail})
                CREATE (u)-[r:RATED]->(ts)
                SET r.Score = $score, r.Feedback = $feedback
            ";

            await session.RunAsync(query, new {
                TVShowName,
                userEmail,
                score, 
                feedback
            });

            var updateAvgScoreQuery = @"
            MATCH (ts:TVShow {Name: $TVShowName})<-[r:RATED]-(u:User)
            WITH ts, AVG(r.Score) AS averageScore
            SET ts.AvgScore = averageScore
            ";

            await session.RunAsync(updateAvgScoreQuery, new
            {
                TVShowName
            });

            return Ok("TV show has been successfully rated");
        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }


    [HttpGet("GetFavoriteMovies/{userEmail}")]
    public async Task<ActionResult> GetFavoriteMovies(string userEmail)
    {
        try
        {
            using var session = _neo4jDriver.AsyncSession();
            var query = @"
                MATCH (u:User {Email: $userEmail})-[:FAVORITE]->(movie:Movie)
                RETURN movie.Duration AS Duration, movie.Name AS Name, movie.YearOfRelease AS YearOfRelease, movie.Genre AS Genre,
                movie.AvgScore as AvgScore, movie.Description as Description, movie.Image as Image, movie.Link as Link 
            ";

            var result = await session.RunAsync(query, new {
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

    [HttpGet("GetFavoriteTVShows/{userEmail}")]
    public async Task<ActionResult> GetFavoriteTVShows(string userEmail)
    {
        try
        {
            using var session = _neo4jDriver.AsyncSession();
            var query = @"
                MATCH (u:User {Email: $userEmail})-[:FAVORITE]->(ts:TVShow)
                RETURN ts.NumOfSeasons AS NumOfSeasons, ts.Name AS Name, ts.YearOfRelease AS YearOfRelease, 
                ts.Genre AS Genre, ts.AvgScore as AvgScore, ts.Description as Description, ts.Image as Image, 
                ts.Link as Link 
            ";

            var result = await session.RunAsync(query, new {
                userEmail
            });

            var tvShows = new List<TVShow>();
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
    
                tvShows.Add(tvShow);
            }
 
            return Ok(tvShows);
        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}