[ApiController]
[Route("[controller]")]
public class UserController : ControllerBase
{
    private readonly IDriver _neo4jDriver;

    public UserController(IDriver neo4jDriver)
    {
        _neo4jDriver = neo4jDriver;
    }


    [HttpPost("Register")]
    public async Task<ActionResult> Register([FromBody]User user)
    {
        try
        {
            using var session = _neo4jDriver.AsyncSession();
            if(string.IsNullOrEmpty(user.FirstName) || user.FirstName.Length>30)
                return BadRequest("Ovo polje je obavezno i mora biti duzine do 30 karaktera");
            if(string.IsNullOrEmpty(user.LastName) || user.LastName.Length>30)
                return BadRequest("Ovo polje je obavezno i mora biti duzine do 30 karaktera");
            if(string.IsNullOrEmpty(user.Email) || !user.Email.EndsWith("@gmail.com") || user.Email.Length>80)
                return BadRequest("Ovo polje je obavezno i mora biti duzine do 80 karaktera i da se zavrsava sa @gmail.com");
            if(string.IsNullOrEmpty(user.Password) || user.Password.Length < 10 || user.Password.Length > 30)
                return BadRequest("Ovo polje je obavezno i mora biti duzine od 10 do 30 karaktera");
            if(string.IsNullOrEmpty(user.TypeOfUser) || (user.TypeOfUser!="user" && user.TypeOfUser!="admin") || user.TypeOfUser.Length>10)
                return BadRequest("Ovo polje je obavezno i mora biti duzine do 10 karaktera, i moze biti admin ili user");
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
            return Ok("Uspesna registracija");
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
                return BadRequest("Ovo polje je obavezno i mora da se zavrsava sa @gmail.com");
            if(string.IsNullOrEmpty(password))
                return BadRequest("Ovo polje je obavezno");
            var query = @"MATCH (u:User {Email: $email}) RETURN u.Password AS hashedPassword";
            var hashedPassword = string.Empty;

            var result = await session.RunAsync(query, new { email });
            while (await result.FetchAsync())
            {
                hashedPassword = result.Current["hashedPassword"].As<string>();
            }

            if (string.IsNullOrEmpty(hashedPassword))
                return BadRequest("Korisnik ne postoji");

            if (!BCrypt.Net.BCrypt.Verify(password, hashedPassword))
                return BadRequest("Neispravna lozinka.");

            return Ok("Uspesna prijava.");
        }
        catch(Exception e)
        {
            return BadRequest(e.Message);
        }
    }
}