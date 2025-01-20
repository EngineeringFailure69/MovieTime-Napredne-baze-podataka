public class Movie : TVProgram {

    [Range(15,240)]
    public required int Duration { get; set; }
    [MaxLength(100)]
    public required string Link { get; set; }
}