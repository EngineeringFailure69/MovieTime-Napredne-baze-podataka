public class FilterRequest
{
    [MaxLength(20)]
    public string? Genre { get; set; }

    [Range(1950, 2100)]
    public int? YearOfRelease { get; set; }
    [Range(0, 10)]
    public int? Grade { get; set; }
    [MaxLength(30)]
    public string? ActorFirstName { get; set; }
    [MaxLength(30)]
    public string? ActorLastName { get; set; }
    [MaxLength(30)]
    public string? DirectorFirstName { get; set; }
    [MaxLength(30)]
    public string? DirectorLastName { get; set; }

}