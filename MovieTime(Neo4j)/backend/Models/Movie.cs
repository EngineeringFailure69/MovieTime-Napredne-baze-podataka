public class Movie : TVProgram {

    [Range(15,240)]
    public required int Duration { get; set; }
}