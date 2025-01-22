public class TVProgram {
    [MaxLength(50)]
    public required string Name { get; set; }

    [Range(1950, 2100)]
    public required int YearOfRelease { get; set; }

    [MaxLength(20)]
    public required string Genre { get; set; }

    [Range(0.0, 10.0)]
    public required double AvgScore { get; set; }

    [MaxLength(200)]
    public required string Description { get; set; }
    
    [MaxLength(5000)]
    public string? Image { get; set; }

    [MaxLength(100)]
    public required string Link { get; set; }
}