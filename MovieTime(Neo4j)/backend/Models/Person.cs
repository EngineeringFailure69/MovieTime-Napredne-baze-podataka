public class Person 
{
    [MaxLength(30)]
    public required string FirstName { get; set;}
    [MaxLength(30)]
    public required string LastName { get; set; }
    public required DateTime DateOfBirth { get; set; }

}