
public class User
{
    [MaxLength(30)]
    public required string FirstName { get; set; }
    [MaxLength(30)]
    public required string LastName { get; set; }
    [MaxLength(80)]
    public required string Email { get; set; }
    [Length(10, 30)]
    public required string Password { get; set; }
    [MaxLength(10)]
    public required string TypeOfUser { get; set; }
}